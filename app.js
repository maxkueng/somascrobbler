var somafm = require('./lib/somafm');
var SomaFmStation = somafm.Station;

var x = new SomaFmStation('480min', '480 Minutes');
x.nowPlaying(function (err, artist, song, album) {
	console.log(artist, song, album);
});

console.log(x);
