var defaults = {
	'dataDir': './data',
	'trackApi': 'http://api2.somascrobbler.com:80',
	'lastfmApiKey': null,
	'lastfmApiSecret': null,
	'username': 'admin',
	'password': 'rompotaya',
	'address': '0.0.0.0',
	'port': 3000,
	'uri': 'http://localhost:3000'
};

module.exports = require('rc')('somascrobbler', defaults);
