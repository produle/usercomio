/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Common Utility functions shared across classes
 *
 */

var crypto = require('crypto');

var utils = {
		
		encrypt: function(data)
				 {
					return crypto.createHash("sha256").update(data).digest("base64");
				 },
				 
		 guidGenerator: function()
		    {
		        var S4 = function() {
		           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		        };
		        return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
		    }
				    
}

module.exports.utils = utils;
