/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Browser Data  Objects (DAO) for server side processing
 *
 */

class BrowserInfo
{
	constructor()
	{
		this.browser = '',
	    this.version =  '',
	    this.os =  '',
	    this.platform= '',
	    this.browserlanguage = ''
	    
	}
}

module.exports.BrowserInfo = BrowserInfo;
