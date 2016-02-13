var defaults = {
	loglevel: 'info',
	datadir: './data',
	trackapi: 'https://api.somascrobbler.com:443',
	lastfm: {
		apikey: null,
		apisecret: null
	},
	admin: {
		username: 'admin',
		password: 'rompotaya'
	},
	server: {
		address: '0.0.0.0',
		port: 3000,
		uri: 'http://localhost:3000'
	}
};

module.exports = require('rucola')('somascrobbler', defaults);
