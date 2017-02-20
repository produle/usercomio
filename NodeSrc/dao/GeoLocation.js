/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Geolocation of the IP, Data  Objects (DAO) for server side processing
 *
 */

class GeoLocation
{
	constructor()
	{
		this.city = '';	
	    this.country =  '';
	    this.region =  '';
	    this.timezone= '';
	 }
}

module.exports.GeoLocation = GeoLocation;
