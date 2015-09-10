var log = require('bole')('web-interface');
var config = require('./config');
var path = require('path');
var through2 = require('through2');
var express = require('express');
var errorhandler = require('errorhandler');
var logger = require('morgan');
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth');
var hbs = require('express-handlebars');

var logStream = through2(function (chunk, enc, next) {
	log.info(chunk.toString('utf-8').trim());
	next();
});

var auth = function (username, password) {
	return function (req, res, next) {
		var user = basicAuth(req);

		if (!user || user.name !== username || user.pass !== password) {
			if (user) { log.warn('unauthorized login attempt', req.ip, req.method, req.originalUrl); }

			res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
			return res.sendStatus(401);
		}

		next();
	};
};

var app = express();

app.set('port', parseInt(config.get('server.port'), 10));
app.set('address', config.get('server.address'));

app.set('views', path.resolve(__dirname, 'views'));
app.engine('.hbs', hbs({
	layoutsDir: path.join(app.get('views'), 'layouts'),
	partialsDir: path.join(app.get('views'), 'partials'),
	defaultLayout: 'main',
	extname: '.hbs'
}));
app.set('view engine', '.hbs');

// development-only settings
if (process.env.NODE_ENV === 'development') {
	app.use(errorhandler())
}

// production-only settings
if (process.env.NODE_ENV === 'production') {
	app.use(auth(config.get('admin.username'), config.get('admin.password')))
}

app.use(logger('dev', { stream: logStream }))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, './static')));
app.use('/', require('./routes'));

app.listen(app.get('port'), app.get('address'));
