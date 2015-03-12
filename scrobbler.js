var log = require('bole')('scrobbler');
var config = require('./config');
var LastfmAPI = require('lastfmapi');
var moment = require('moment');
var accounts = require('./accounts');

var nowPlayingTracks = {};

var getLastfmClient = (function (accountId) {
	var cache = {};

	function getClient (accountId) {
		cache[accountId] = cache[accountId] || (function () {
			var account = accounts.get(accountId);

			log.debug('create last.fm client', accountId.substr(0, 8), account.username);

			var client = new LastfmAPI({
				api_key: config.lastfmApiKey,
				secret: config.lastfmApiSecret
			});

			client.setSessionCredentials(account.username, account.sessionKey);

			return client;
		})();

		return cache[accountId];
	};

	return getClient;
})();

function tag (accountId, track) {
	var account = accounts.get(accountId);
	var client = getLastfmClient(accountId);
	var tags = [ 'somafm', track.stationId ];

	client.track.addTags(track.artist, track.title, tags, function (err) {
		if (err) {
			return log.error('tag', track.stationId + ' -> ' + account.username, 'error', err);
		}

		return log.info('tag', track.stationId + ' -> ' + account.username);
	});
}

function updateNowPlaying (accountId, track) {
	var account = accounts.get(accountId);
	var client = getLastfmClient(accountId);

	var now = moment.utc();
	var delta = +now - track.time;
	var remainingDuration = track.duration - delta;
	if (remainingDuration < 0) { remainingDuration = 1; }

	var params = {
		artist: track.artist,
		track: track.title,
		album: track.album,
		mbid: track.trackMBID,
		duration: Math.floor(remainingDuration / 1000) + 60
	};

	var fails = account.failCount || 0;

	client.track.updateNowPlaying(params, function (err, nowPlaying) {
		if (err) {
			log.error('now playing', track.stationId + ' -> ' + account.username, 'error', err);

			if (err.error == 9) {
				fails += 1;
				if (fails >= 4) {
					accounts.set(account.id, 'authorized', false);
				}
			}

			accounts.set(account.id, 'failCount', fails);
			return;
		}

		log.info('now playing', track.stationId + ' -> ' + account.username);
	});
}

function scrobble (accountId, track) {
	var account = accounts.get(accountId);
	var client = getLastfmClient(accountId);

	var params = {
		artist: track.artist,
		track: track.title,
		album: track.album,
		mbid: track.trackMBID,
		timestamp: Math.floor(track.time / 1000)
	};

	var fails = account.failCount || 0;

	client.track.scrobble(params, function (err, scrobbles) {
		if (err) {
			if (err.error == 9) {
				fails += 1;
				if (fails >= 4) {
					accounts.set(account.id, 'authorized', false);
				}
			}

			accounts.set(account.id, 'failCount', fails);
			log.error('scrobble', track.stationId + ' -> ' + account.username, 'error', err);
			return;
		}

		log.info('scrobble', track.stationId + ' -> ' + account.username);
	});
}


function bindTrack (fn, track) {
	if (!track) { return function noop () {}; }
	return function (accountId) {
		fn.call(null, accountId, track);
	};
}

function submit (track) {
	log.info('track', track.stationId + ':', track.artist + ' - ' + track.title);

	var tagTrack = bindTrack(tag, track);
	var updateNowPlayingTrack = bindTrack(updateNowPlaying, track);
	var scrobblePreviousTrack = bindTrack(scrobble, nowPlayingTracks[track.stationId || null]);

	nowPlayingTracks[track.stationId] = track;

	accounts.find(function (account) {
		return (
			account.stationId === track.stationId &&
			account.authorized &&
		    account.enabled );
	})
	.forEach(function (account) {
		tagTrack(account.id);
		updateNowPlayingTrack(account.id);
		scrobblePreviousTrack(account.id);
	});
}

exports.submit = submit;
