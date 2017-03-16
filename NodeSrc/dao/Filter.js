/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Filter Data  Objects (DAO) for server side processing
 *
 */

class Filter
{
	constructor()
	{
		this._id = null,
	    this.name =  null,
	    this.filter =  null,
	    this.mongoFilter= null,
	    this.createDate = null
	    this.creator = null
	    this.appid = null

	}
}

module.exports.BrowserInfo = BrowserInfo;
