var uuid = require("node-uuid");

exports.make = function () {
	var buf = new Buffer(16);

	uuid.v4({}, buf);

	var id = buf.toString("base64");

	id = id.replace(/\+/g, "-");
	id = id.replace(/\//g, "_");
	id = id.replace(/=/g, "");

	return id;
};
