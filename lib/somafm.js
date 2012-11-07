var util = require('util');
var events = require('events');
var timers = require('timers');
var jsdom = require('jsdom');

var Station = exports.Station = function (stationId, stationName) {

	this.stationId = stationId || '';
	this.stationName = stationName || '';
	this.currentTrack = null;

	events.EventEmitter.call(this);
};

util.inherits(Station, events.EventEmitter);

Station.prototype.nowPlaying = function (callback) {
	jsdom.env('http://somafm.com/recent/' + this.stationId + '.html', 
		[ 'http://code.jquery.com/jquery-1.8.2.min.js' ],
		function (err, window) {
			if (err && typeof callback === 'function') { return callback(err); }

			var document = window.document,
				$ = window.$,
				i, len, rows, cols,
				time, artist, song, album;

			rows = $('table tr');

			for (i = 0, len = rows.length; i < len; i++) {
				cols = $(rows[i]).children('td');
				if (cols.length !==5) { continue; }

				time = $(cols[0]).text();
				artist = $(cols[1]).text();
				song = $(cols[2]).text();
				album = $(cols[3]).text();

				if (/\(now\)/i.test(time)) {
					if (typeof callback === 'function') {
						callback(false, artist, song, album);
					}
				}
			}

			window.close();
		}
	);
};

Station.prototype.checkForNewTrack = function () {
	var self = this, trackId;

	self.nowPlaying(function (err, artist, song, album) {
		if (err) { throw err; }
		
		trackId = artist + '-' + song;
		if (trackId !== self.trackId) {
			self.trackId = trackId;
			self.emit('track', artist, song, album);
		}

		timers.setTimeout(function () {
			self.checkForNewTrack();
		}, 30000);
	});
};

Station.prototype.start = function () {
	this.checkForNewTrack();
};
