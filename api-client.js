var config = require('./config');
var log = require('bole')('api-client');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var url = require('url');
var request = require('superagent');
var io = require('socket.io-client');

module.exports = assign({},
	EventEmitter.prototype,
	{
		apiUrl: config.trackApi,
		cache: {},

		connect: function () {
			log.info('connecting to', this.apiUrl);
			this.socket = io.connect(this.apiUrl);

			this.socket.on('connect', function () {
				log.info('connected to', this.apiUrl);
				process.nextTick(function () {
					this.subscribeAll();
				}.bind(this));
			}.bind(this));

			this.socket.on('track', this.emitTrack.bind(this));
		},

		getStations: function (callback) {
			var self = this;

			if (this.cache.stations) {
				return process.nextTick(callback.bind(this, null, this.cache.stations));
			}

			var uri = url.resolve(this.apiUrl, '/api/v1/stations');

			request
				.get(uri)
				.end(function (err, res) {
					if (err) { return callback(err); }
					if (!res.body) { return callback(new Error('Request failed: ' + uri)); }
					self.cache.stations = res.body;
					callback(null, self.cache.stations);
				});
		},

		subscribeAll: function () {
			var self = this;

			this.getStations(function (err, stations) {
				if (err) { return log.error(err); }

				Object.keys(stations).forEach(function (stationId) {
					self.socket.emit('subscribe', stationId, function (response) {
						if (response.subscribed) {
							return log.info('subscribed', stationId);
						}

						log.error('failed to subscribe', stationId);
					});
				});
			});
		},

		emitTrack: function (track) {
			this.emit('track', track);
		}
	}
);
