var _ = require('underscore');
var express = require('express');
var ejs = require('express');
var expressLayouts = require('express-ejs-layouts');
var path = require('path');
var natural = require('natural');
var soundEx = natural.SoundEx;
var somafm = require('./lib/somafm');
var SomaFmStation = somafm.Station;
var LastFmNode = require('lastfm').LastFmNode;
var databank = require('databank');
var Databank = databank.Databank;
var DatabankObject = databank.DatabankObject;
var Station = require('./lib/station').Station;
var ScrobblerAccount = require('./lib/scrobbleraccount').ScrobblerAccount;

var config = require('./config');

var avgDuration = null;

var lfm = new LastFmNode({
	api_key: config.lastfmAPIKey,
	secret: config.lastfmAPISecret
});

var stations = config.stations || {};

var db = Databank.get('disk', {
	'dir' : path.join('.', 'data'),
	'schema' : {
		'station' : Station.schema,
		'scrobbleraccount' : ScrobblerAccount.schema
	}
});

var trackInfo = function (artist, track, callback) {
	lfm.request('track.getInfo', {
		'artist' : artist,
		'track' : track,
		'handlers' : {
			'success' : function (rsp) {
				if (rsp.track) {
					callback(null, rsp.track);
				} else {
					callback(new Error("No track info"));
				}
			},
			'error' : function (err) {
				callback(err);
			}
		}
	});
};

var trackCorrection = function (artist, track, callback) {
	lfm.request('track.getCorrection', {
		'artist' : artist,
		'track' : track,
		'handlers' : {
			'success' : function (rsp) {
				if (rsp.corrections && rsp.corrections.correction) {
					callback(null, rsp.corrections.correction);
				} else {
					callback(new Error("No correction"));
				}
			},
			'error' : function (err) {
				callback(err);
			}
		}
	});
};

var tag = function (station, artist, track, tags, callback) {

	station.accounts.forEach(function (account) {
		if (account.lastfm) {
			account.lastfm.request('track.addTags', {
				'artist' : artist,
				'track' : track,
				'tags' : tags.join(','),
				'sk' : account.lastfmSession.key,
				'handlers' : {
					'success' : function (rsp) {
						callback(null);
					},
					'error' : function (err) {
						callback(err);
					}
				}
			});
		}
	});

};

var scrobble = function (station, artist, song, album, mbid, duration, callback) {
	station.accounts.forEach(function (account) {
		if (!account.lastfm) {
			account.lastfm = new LastFmNode({
				api_key: config.lastfmAPIKey,
				secret: config.lastfmAPISecret
			});
			account.lastfmSession = account.lastfm.session(account.username, account.sessionKey);
		}

		if (account.prevTrack) {
			account.lastfm.update('scrobble', account.lastfmSession, {
				'track' : account.prevTrack,
				'timestamp' : account.utcTimestamp,
				'handlers' : {
					'success' : function (rsp) {
					},
					'error' : function (error) {
					}
				}
			});
		}

		var track = {
			'name' : song, 
			'artist' : { '#text' : artist }
		};
		if (album) { track.album = { '#text' : album }; }
		if (mbid) { track.mbid = mbid; }

		account.prevTrack = track;
		account.utcTimestamp = Math.floor((new Date()).getTime() / 1000);

		account.lastfm.update('nowplaying', account.lastfmSession, {
			'track' : track,
			'duration' : Math.floor(duration / 1000),
			'handlers' : {
				'success' : function (rsp) {
					console.log(station.stationId, ':', artist, '-', song, '-', album);
				},
				'error' : function (error) {
					if (error.error && error.error === 9) {
						// Invalid session key
						if (!account.failCount) { account.failCount = 0; }
						account.failCount++;

						if (account.failCount > 3) {
							account.update({
								'isAuthorized' : false

							}, function (err, obj) {
								if (err) { throw err; }
								station.accounts.splice(station.accounts.indexOf(account), 1);
							});
						}

					}
				}
			}
		});

	});
};

db.connect({}, function (err) {
	if (err) { throw err; }
	DatabankObject.bank = db;

	_.forEach(stations, function (station, key, list) {
		station.accounts = [];

		ScrobblerAccount.search({
			'stationId' : station.stationId,
			'isAuthorized' : true

		}, function (err, accounts) {
			if (err) { throw err; }
			
			_.forEach(accounts, function (account) {
				station.accounts.push(account);
			});
		});

		station.somafm = new SomaFmStation(station.stationId, station.stationName);
		station.somafm.on('track', function (artist, song, album) {
			trackCorrection(artist, song, function (err, correction) {
				if (!err) {
					if (+correction['@attr'].artistcorrected === 1) {
						artist = correction.track.artist.name;
					}
					if (+correction['@attr'].trackcorrected === 1) {
						song = correction.track.name;
					}
				}

				trackInfo(artist, song, function (err, info) {
					var scrobbleAlbum = false;
					var mbid = null;
					var duration = null;

					if (!err) {
						if (info.album && info.album.title) {
							var lev = natural.LevenshteinDistance(info.album.title, album);

							if (lev <= 4) {
								scrobbleAlbum = true;
							} else {
								scrobbleAlbum = soundEx.compare(info.album.title, album);
							}

							if (scrobbleAlbum) {
								album = info.album.title;
							}

							album = (scrobbleAlbum) ? info.album.title : null;
						}

						if (info.duration) {
							if (avgDuration) {
								avgDuration = Math.floor((avgDuration + Number(info.duration)) / 2);
							} else {
								avgDuration = Number(info.duration);
							}
						}

						duration = (info.duration) ? Number(info.duration) : avgDuration;
						mbid = (info.mbid) ? info.mbid : null;

						scrobble(station, artist, song, album, mbid, duration, function (err) { });
						tag(station, artist, song, [ 'somafm', station.stationId ], function (err) { });

					} else {
						// No info, so we scrobble as-is
						scrobble(station, artist, song, null, avgDuration, function (err) { });
						tag(station, artist, song, [ 'somafm', station.stationId ], function (err) { });
					}
				});

			});

		});
		station.somafm.start();
	});
});

var app = express();

app.configure(function () {
	app.set('view engine', 'ejs');
	app.set('layout', 'layout');
	app.set('views', __dirname + '/views');

//	app.use(express.logger());
	app.use(express.cookieParser());
	app.use(express.cookieSession({ 'secret' : 'ohlala' }));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(expressLayouts);
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.get('/', function (req, res) {
	res.render('index', {
		'req' : req,
		'res' : res
	});
});

app.get('/addaccount', function (req, res) {
	res.render('addaccount', {
		'req' : req,
		'res' : res,
		'stations' : stations
	});
});

app.post('/addaccount', function (req, res) {
	var description, station;

	description = req.body.description;
	station = req.body.station;

	if (!stations.hasOwnProperty(station)) { return res.redirect('/error'); }

	ScrobblerAccount.create({
		'description' : description,
		'stationId' : station

	}, function (err, obj) {
		if (err) { throw err; }
		req.session.scrobblerAccountId = obj.id;

		res.redirect('http://www.last.fm/api/auth/?api_key=' + config.lastfmAPIKey + '&cb=' + config.baseURL + 'authenticate');
	});
});

app.get('/addaccountok', function (req, res) {
	res.render('addaccountok', {
		'req' : req,
		'res' : res
	});
});

app.get('/authenticate', function (req, res) {
	var token = req.query.token;

	var lastfm = new LastFmNode({
		api_key: config.lastfmAPIKey,
		secret: config.lastfmAPISecret
	});

	lastfm.session().authorise(token, {
		handlers: {
			authorised: function(session) {
				ScrobblerAccount.get(req.session.scrobblerAccountId, function (err, obj) {
					if (err) { throw err; }

					ScrobblerAccount.search({
						'sessionKey' : session.key

					}, function (err, accounts) {
						if (accounts.length === 0) {
							obj.update({
								'sessionKey' : session.key,
								'username' : session.user,
								'isAuthorized' : true

							}, function (err, obj) {
								if (err) { throw err; }

								if (stations.hasOwnProperty(obj.stationId)) {
									stations[obj.stationId].accounts.push(obj);
								}

								res.redirect('/addaccountok');
							});

						} else {
							res.redirect('/addaccountok?alreadyexists=1');
						}
					});
				});
			},
			error: function (error) {
			}
		}
	});
});

app.listen(config.httpPort || 9999, function () {
});
