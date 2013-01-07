var databank = require('databank');
var DatabankObject = databank.DatabankObject;

var Station = DatabankObject.subClass('station');

Station.schema = {
	'pkey' : 'id',
	'fields' : [
		'id',
		'displayName',
		'lastfmToken'
	]
};

exports.Station = Station;
