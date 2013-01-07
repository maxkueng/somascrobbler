var uuid = require('./uuid');
var databank = require('databank');
var DatabankObject = databank.DatabankObject;

var ScrobblerAccount = DatabankObject.subClass('scrobbleraccount');

ScrobblerAccount.schema = {
	'pkey' : 'id',
	'fields' : [
		'id',
		'isAuthorized',
		'description',
		'stationId',
		'sessionKey',
		'username'
	]
};

ScrobblerAccount.beforeCreate = function (props, callback) {
	if (!props.id) { props.id = uuid.make(); }
	if (!props.isAuthorized) { props.isAuthorized = false; } 

	callback(null, props);
};

exports.ScrobblerAccount = ScrobblerAccount;

