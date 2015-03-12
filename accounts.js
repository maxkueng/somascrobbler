var config = require('./config');
var path = require('path');
var dsds = require('dsds');

module.exports = dsds('accounts', { filePath: path.resolve(config.dataDir, 'accounts.json') });
