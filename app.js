var debug = require('debug')('scrobbler'),
	debugTag = require('debug')('scrobbler:tag'),
	debugNowPlaying = require('debug')('scrobbler:nowplaying'),
	debugScrobble = require('debug')('scrobbler:scrobble'),
	debugTrack = require('debug')('scrobbler:track'),
	debugSubscribe = require('debug')('scrobbler:subscribe'),
	debugHTTP = require('debug')('scrobbler:http'),
	config = require('./config.json'),
	url = require('url'),
	path = require('path'),
	express = require('express'),
	ejs = require('ejs'),
	expressLayouts = require('express-ejs-layouts'),
	io = require('socket.io-client'),
	LastfmAPI = require('lastfmapi'),
	moment = require('moment'),
	dsds = require('dsds'),
	stations = require('./stations.json'),
	accounts = dsds('accounts', { filePath: path.join(config.data_dir || '.', 'accounts.json') }),
	noop = function noop () {},
	
	currentTracks = {};

var lastfmClient = (function () {
	var cache = {};

	function getClient (accountId) {
		cache[accountId] = cache[accountId] || (function () {
			var account = accounts.get(accountId),

				client = new LastfmAPI({
					api_key: config.lastfm.api_key,
					secret: config.lastfm.api_secret
				});

			client.setSessionCredentials(account.username, account.sessionKey);

			return client;
		})();

		return cache[accountId];
	}

	return getClient;
})();

function proxyUrl () {
	return url.format(config.web_interface.proxy);
}

function scrobblerApiUrl () {
	return config.scrobbler_api.protocol + '://'
	       + config.scrobbler_api.hostname
	       + ':' + config.scrobbler_api.port;
}

function tag (accountId, track) {
	var account = accounts.get(accountId),
		client = lastfmClient(accountId),
		tags = [ 'somafm', track.stationId ];

	client.track.addTags(track.artist, track.title, tags, function (err) {
		if (err) {
			debugTag(track.stationId + ' -> ' + account.username, 'error', err);
		} else {
			debugTag(track.stationId + ' -> ' + account.username, track.artist, '-', track.title, tags);
		}
	});

}

function updateNowPlaying (accountId, track) {
	var account = accounts.get(accountId),
		client = lastfmClient(accountId),

		now = moment.utc(),
		timePassed = +now - track.time,
		remainingDuration = track.duration - timePassed,

		params = {
			artist: track.artist,
			track: track.title,
			album: track.album,
			mbid: track.trackMBID,
			duration: Math.floor(remainingDuration / 1000) + 60
		},
		
		fails = account.failCount || 0;

	client.track.updateNowPlaying(params, function (err, nowPlaying) {
		if (err) {
			debugNowPlaying(track.stationId + ' -> ' + account.username, 'error', err);
			
			if (err.error == 9) {
				fails += 1;
				if (fails >= 4) {
					accounts.set(account.id, 'authorized', false);
				}
			}

			accounts.set(account.id, 'failCount', fails);
			debugNowPlaying(track.stationId + ' -> ' + account.username, 'failCount', fails);

			return;
		}

		debugNowPlaying(track.stationId + ' -> ' + account.username, params.artist, '-', params.track, params.duration + 's');
	});

}

function scrobble (accountId, track) {
	var account = accounts.get(accountId),
		client = lastfmClient(accountId),

		params = {
			artist: track.artist,
			track: track.title,
			album: track.album,
			mbid: track.trackMBID,
			timestamp: Math.floor(track.time / 1000)
		},
		
		fails = account.failCount || 0;

	client.track.scrobble(params, function (err, scrobbles) {
		if (err) {
			if (err.error == 9) {
				fails += 1;
				if (fails >= 4) {
					accounts.set(account.id, 'authorized', false);
				}
			}

			accounts.set(account.id, 'failCount', fails);
			debugScrobble(track.stationId + ' -> ' + account.username, 'failCount', fails);
			return
		}

		debugScrobble('scrobble', track.stationId + ' -> ' + account.username, params.artist, '-', params.track);
	});

}

function handleTrack (track) {
	debugTrack(track.stationId, track.artist, '-', track.title);

	var tagTrack = (function (track) {
		return function (account) {
			tag(account.id, track);
		};
	})(track);

	var updateNowPlayingTrack = (function (track) {
		return function (account) {
			updateNowPlaying(account.id, track);
		};
	})(track);

	var scrobblePreviousTrack = (function (track) {
		if (!track) { return function noop () {}; }

		return function (account) {
			scrobble(account.id, track);
		};
	})(currentTracks[track.stationId] || null);

	currentTracks[track.stationId] = track;

	var stationAccounts = accounts.find(function (account) {
		return ( account.stationId === track.stationId 
		         && account.authorized
		         && account.enabled );
	});

	stationAccounts.forEach(tagTrack);
	stationAccounts.forEach(updateNowPlayingTrack);
	stationAccounts.forEach(scrobblePreviousTrack);
}

var socket = io.connect(scrobblerApiUrl());

socket.on('connect', function () {
	Object.keys(stations).forEach(function (stationId) {
		socket.emit('subscribe', stationId, function (response) {
			if (response.subscribed) {
				return debugSubscribe(stationId, 'OK');
			}

			debugSubscribe(stationId, 'FAIL');
		});
	});
});

socket.on('track', handleTrack);

var lfm = new LastfmAPI({
	api_key: config.lastfm.api_key,
	secret: config.lastfm.api_secret
});

var app = express();

app.set('port', config.port || process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.logger('dev'));
app.use(express.basicAuth(config.web_interface.username, config.web_interface.password));
app.use(express.json());
app.use(express.urlencoded());
app.use(expressLayouts);
app.use(app.router);

if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', function (req, res) {
	res.render('index', {
		nav: 'accounts',
		accounts: accounts.all()
	});
});

app.get('/add-account', function (req, res) {
	res.render('add-account', {
		nav: 'add-account',
		mode: 'create',
		stations: stations
	});
});

app.get('/add-account/:id', function (req, res) {
	res.render('add-account', {
		nav: 'add-account',
		mode: 'success',
		account: accounts.get(req.param('id')),
		stations: stations
	});
});

app.post('/add-account', function (req, res) {
	var stationId = req.body.station,
		urlObj,
		account,
		callbackURL;

	if (!stations.hasOwnProperty(stationId)) { return res.redirect('/add-account'); }

	account = accounts.insert({
		stationId: stationId,
		authorized: false,
		enabled: false
	});

	urlObj = url.parse(proxyUrl());
	urlObj.pathname = '/authenticate';
	urlObj.query = { id: account.id };
	callbackURL = url.format(urlObj);

	res.redirect(lfm.getAuthenticationUrl({ cb: callbackURL }));
});

app.get('/authenticate', function (req, res) {
	var id = req.query.id,
		token = req.query.token,
		account = accounts.get(id);

	lfm.authenticate(token, function (err, session) {
		if (err) {
			debugHTTP('error', err);

			accounts.remove(id);
			return res.redirect('/add-account');
		}

		account = accounts.update(account.id, {
			sessionKey: session.key,
			username: session.username,
			authorized: true,
			enabled: true
		});

		res.redirect('/add-account/' + account.id);
	});
});

app.listen(app.get('port'));
