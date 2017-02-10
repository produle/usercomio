/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the visitor tracking code 
 *
 */

var express = require("express");
var app = require("../server").app;
var cors = require('cors');
var useragent = require('express-useragent');
var BrowserInfo = require("../dao/BrowserInfo").BrowserInfo;
var GeoLocation = require("../dao/GeoLocation").GeoLocation;
var VisitorMetaInfo = require("../dao/VisitorMetaInfo").VisitorMetaInfo;
var utils = require("../core/utils.js").utils;

class VisitorTrackingManager {

  constructor()
    {

        this.app = app;
        
        this.app.use(cors())
        this.app.use(useragent.express());
        this.router = express.Router(); 

        
        this.router.post("/ping",(req, res) => { this.handlePing(req,res); });
        this.router.post("/event",(req, res) => { this.handleEvents(req,res); });
        this.router.post("/error",(req, res) => { this.handleError(req,res); });
        
    }
  	
  	/*
  	 * @desc Handle inital ping that happens when page loads or when the script is initialized
  	 */
  	handlePing(req,res)
  	{
  		var agent = req.useragent;
  		
  		var visitorDetail = {};
  		
  		var uid = null;
  		
  		var sessioncookie = req.cookies["usercomio_session"];
  		
  		if(!req.body.userdata.email || req.body.userdata.email.length == 0)
  		{
  			if(!req.body.userdata.userid || req.body.userdata.userid.length == 0)
  			{
  				return res.send({status:'failure',msg:'Either email or userid should be provided'})
  			}
  			else
  			{
  				uid = req.body.userdata.userid
  			}
  		}
  		else
  		{
  			uid = req.body.userdata.email;
  		}
  	
  		
  		
  		visitorDetail["_id"] = uid;
  		
  		if(!sessioncookie)
  		{
  			visitorDetail["sessionid"] = utils.guidGenerator();
  		}
  		else
  		{
  			visitorDetail["sessionid"] = sessioncookie;
  		}
  		
  		
  		
  		
  		var browserInfo = new BrowserInfo();
  		var geolocation = new GeoLocation();
  		var visitorMetaInfo = new VisitorMetaInfo();
  		
  		browserInfo.browser = agent.browser;
  		browserInfo.version =  agent.version;
  		browserInfo.os =  agent.os;
  		browserInfo.platform= agent.platform;
  		browserInfo.browserlanguagae = req.headers["accept-language"].split(',')[0];
  		
  		
		visitorDetail["agentinfo"]  = browserInfo;
  		visitorDetail["geolocationinfo"]  = geolocation;
  		visitorDetail["visitordata"]  = req.body.userdata;
  		
  		
  		// Get the documents collection
        var visitorCollection = global.db.collection('visitors');

        var status = "success";
        
        visitorCollection.findOne({ _id: uid },function(err,visitor)
        {
      	  if(err)
      	  {
      		  res.status(500);
      		  return res.send({status:'failure'});
      	  }
      	  
      	  if(visitor)
      	  {
      	  		if(!sessioncookie)
	      		{
      	  			res.cookie('usercomio_session',visitorDetail["sessionid"], { httpOnly: true });
	      		}
      	  		
      		  	var lastseen = new Date();
      		  	
      		  	
      		  	for(var key in req.body.userdata)
      		  	{
      		  		visitorDetail["visitordata"][key] = req.body.userdata[key];
      		  	}
      		  	
  		  		visitorCollection.update({_id:uid},{$set:{agentinfo:browserInfo,'visitormetainfo.lastseen':lastseen,visitordata:visitorDetail["visitordata"]}},function(err,count,result)
	      		{
	  		  		if (err)
	  	            {
	  	            	return res.send({status:'failure'});
	  	            }
	  	            else
	  	            {
	  	            	return res.send({status:visitor});
	  	            }
	      		});
      	  }
      	  else
      	  {
      		visitorMetaInfo.firstseen = new Date();
      		visitorMetaInfo.lastseen = new Date();
      		
      		visitorDetail["visitormetainfo"]  = visitorMetaInfo;  
      		
      		res.cookie('usercomio_session',visitorDetail["sessionid"], { httpOnly: true });
      		
      		visitorCollection.insert([visitorDetail], function (err, result) 
                {
      	            if (err)
      	            {
      	            	res.status(500);
      	      		  	return res.send({status:'failure'});
      	            }
      	            else
      	            {
      	            	return res.send({status:visitorDetail});
      	            }
      	            
      	           
      	        });
      	  }
      	  
        });
  		
       
  	}
  	
  	/*
  	 * @desc Handles events
  	 */
  	handleEvents(req,res)
  	{
  		var uid = null;
  		
  		if(!req.body.userdata.email || req.body.userdata.email.length == 0)
  		{
  			if(!req.body.userdata.userid || req.body.userdata.userid.length == 0)
  			{
  				return res.send({status:'failure',msg:'Either email or userid should be provided'})
  			}
  			else
  			{
  				uid = req.body.userdata.userid
  			}
  		}
  		else
  		{
  			uid = req.body.userdata.email;
  		}
  		
  		var visitorEventDetail = {};
  		
  		visitorEventDetail["_id"] =  req.body.uid;
  		visitorEventDetail["sessionid"] = req.cookies["usercomio_session"];
  		visitorEventDetail["appid"] =  req.body.appid;
  		visitorEventDetail["createdate"] = new Date();
  		visitorEventDetail["userid"]  = uid;
  		visitorEventDetail["eventname"] = req.body.eventname;
  		visitorEventDetail["eventproperties"] = req.body.properties;
  		
  		
  		
  		
  		// Get the documents collection
        var visitorEventCollection = global.db.collection('visitorevents');

        visitorEventCollection.insert([visitorEventDetail], function (err, result) 
                {
      	            if (err)
      	            {
      	            	res.status(500);
      	      		  	return res.send({status:'failure'});
      	            }
      	            else
      	            {
      	            	return res.send({status:'success'});
      	            }
      	            
      	           
      	        });
  		
  	}
  	
  	handleError(req,res)
  	{
         var uid = null;
  		
  		if(!req.body.userdata.email || req.body.userdata.email.length == 0)
  		{
  			if(!req.body.userdata.userid || req.body.userdata.userid.length == 0)
  			{
  				return res.send({status:'failure',msg:'Either email or userid should be provided'})
  			}
  			else
  			{
  				uid = req.body.userdata.userid
  			}
  		}
  		else
  		{
  			uid = req.body.userdata.email;
  		}
  		
  		var visitorPageErrorDetail = {};
  		
  		visitorPageErrorDetail["_id"] =  req.body.uid;
  		visitorPageErrorDetail["sessionid"] = req.cookies["usercomio_session"];
  		visitorPageErrorDetail["appid"] =  req.body.appid;
  		visitorPageErrorDetail["occuredon"] = new Date();
  		visitorPageErrorDetail["userid"]  = uid;
  		visitorPageErrorDetail["error"] = req.body.errormsg;
  		
  		// Get the documents collection
        var visitorPageErrorCollection = global.db.collection('visitorpageerror');

        visitorPageErrorCollection.insert([visitorPageErrorDetail], function (err, result) 
                {
      	            if (err)
      	            {
      	            	res.status(500);
      	      		  	return res.send({status:'failure'});
      	            }
      	            else
      	            {
      	            	return res.send({status:'success'});
      	            }
      	            
      	           
      	        });
  	}
  
  	
}


module.exports.VisitorTrackingManager = VisitorTrackingManager;
