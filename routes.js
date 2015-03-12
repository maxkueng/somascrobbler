var url = require('url');
var router = require('express').Router();
var log = require('bole')('web-interface');
var LastfmAPI = require('lastfmapi');
var config = require('./config');
var apiClient = require('./api-client');
var accounts = require('./accounts');

var lastfm = new LastfmAPI({
	api_key: config.lastfmApiKey,
	secret: config.lastfmApiSecret
});

router.get('/', function (req, res) {
	res.render('index', {
		accounts: accounts.all()
	});
});

router.get('/add-account', function (req, res) {
	apiClient.getStations(function (err, stations) {
		if (err) { return res.sendStatus(500); }

		stations = Object.keys(stations).map(function (key) { return stations[key]; });

		res.render('add-account', {
			stations: stations
		});
	});
});

router.post('/add-account', function (req, res) {
	var stationId = req.body.station;

	var account = accounts.insert({
		stationId: stationId,
		authorized: false,
		enabled: false
	});

	var urlObj = url.parse(config.uri);
	urlObj.pathname = '/authenticate';
	urlObj.query = { id: account.id };

	res.redirect(lastfm.getAuthenticationUrl({ cb: urlObj.format() }));
});

router.get('/authenticate', function (req, res) {
	var accountId = req.query.id;
	var token = req.query.token;
	var account = accounts.get(accountId);

	lastfm.authenticate(token, function (err, session) {
		if (err) {
			log.error('last.fm authorization failed', err);
			accounts.remove(accountId);
			return res.redirect('/add-account');
		}

		accounts.update(accountId, {
			sessionKey: session.key,
			username: session.username,
			authorized: true,
			enabled: true
		});

		res.redirect('/');
	});
});

module.exports = router;
