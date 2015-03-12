var bole = require('bole');
var log = bole('server');
var config = require('./config');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

bole.output({
	level: 'info',
	stream: process.stdout
});

log.info('env', process.env.NODE_ENV);

var webInterface = require('./web-interface');
var apiClient = require('./api-client');
var scrobbler = require('./scrobbler');

apiClient.connect();

apiClient.on('track', scrobbler.submit.bind(scrobbler));
