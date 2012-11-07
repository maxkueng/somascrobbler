var somafm = require('./lib/somafm');
var SomaFmStation = somafm.Station;
var Lastfm = require('lastfm').LastFmNode;

var stations = [
	{
		'stationId' : 'groovesalad',
		'stationName' : 'Groove Salad'
	}
/*	{
		'stationId' : 'lush',
		'stationName' : 'Lush'
	},
	{
		'stationId' : 'dronezone',
		'stationName' : 'Drone Zone'
	},
	{
		'stationId' : 'sonicuniverse',
		'stationName' : 'Sonic Universe'
	} */
];


var i, len;

for (i = 0, len = stations.length; i < len; i++) {
	(function (station) {
		station.lastfm = new Lastfm({
			'api_key' : 'b7864bb468629947c55e8059549b580c',
			'secret' : 'c5a0b171e9422de97bb6575c00ae77aa',
			'useragent' : 'somascrobbler/v0.0.1',
		});

		/*
		station.lastfm.request('auth.getToken', {
			'handlers' : {
				'success' : function (data) {
					console.log('http://www.last.fm/api/auth/?api_key=' + station.lastfm.api_key + '&token=' + data.token);
					process.exit();
				}
			}
		});
		*/

		station.lastfmSession = station.lastfm.session();
		var token = '7db439e2f3c5153c40ff056f2200d114';
		station.lastfmSession.authorise(token, {
			'handlers' : {
				'authorised' : function (session) {
					station.soma = new SomaFmStation(station.stationId, station.stationName);
					station.soma.on('track', function (artist, song, album) {
						station.lastfm.update('nowplaying', session, {
							'track' : {
								'artist' : { '#text' : artist },
								'name' : song,
								'album' : { '#text' : album }
							},

							'handlers' : {
								'success' : function (data) {
									console.log('ok', data);
								},
								'error' : function (err) {
									console.log('err', err);
								}
							}
						});
					});

					station.soma.start();
				},
				'error' : function (error) {
					console.log('err', error);
				}
			}	
		});





//		console.log('S:', station.lastfm.getSessionKey);

		/*
		station.lastfm.getSessionKey(function (result) {

			console.log("session key = " + result.session_key);

			if (result.success) {
				station.soma = new SomaFmStation(station.stationId, station.stationName);
				station.soma.on('track', function (artist, song, album) {
					console.log(station.stationName, ':', artist, ' - ', song, ' - ', album);

					station.lastfm.scrobbleNowPlayingTrack({
						'artist' : artist,
						'track' : song,
						'callback' : function (result) {
							console.log("in callback, finished: ", result);
						}
					});

					station.soma.start();
				});

			}
		}); */


	})(stations[i]);
}
