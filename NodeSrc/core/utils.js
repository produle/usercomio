var crypto = require('crypto');

var utils = {
		
		encrypt: function(data)
				 {
					return crypto.createHash("sha256").update(data).digest("base64");
				 }
}

module.exports.utils = utils;