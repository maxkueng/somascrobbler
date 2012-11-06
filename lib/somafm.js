var util = require('util');
var events = require('events');
var timers = require('timers');
var request = require('request');
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
				time, artist, song, album,
				trackId;

			rows = $('table tr');

			for (i = 0, len = rows.length; i < len; i++) {
				cols = $(rows[i]).children('td');
				if (cols.length !==5) { continue; }

				time = $(cols[0]).text();
				artist = $(cols[1]).text();
				song = $(cols[2]).text();
				album = $(cols[2]).text();

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

Station.prototype.start = function () {
};
