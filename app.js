var somafm = require('./lib/somafm');
var SomaFmStation = somafm.Station;

var stations = [
	{
		'stationId' : 'groovesalad',
		'stationName' : 'Groove Salad'
	},
	{
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
	}
];

var i, len;

for (i = 0, len = stations.length; i < len; i++) {
	(function (station) {
		station.soma = new SomaFmStation(station.stationId, station.stationName);
		station.soma.on('track', function (artist, song, album) {
			console.log(station.stationName, ':', artist, ' - ', song, ' - ', album);
		});

		station.soma.start();
	})(stations[i]);
}
