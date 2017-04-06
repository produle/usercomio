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
var geoip = require("geoip-lite");

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
        this.router.post("/logout",(req, res) => { this.handleLogout(req,res); });
        
    }
  	
  	/*
  	 * @desc Handle inital ping that happens when page loads or when the script is initialized
  	 */
  	handlePing(req,res)
  	{
  		var agent = req.useragent;
  		
  		var visitorDetail = {};

  		var sessionDetail = {};
  		
  		var uid = null;
  		
  		var sessioncookie = req.cookies["usercomio_session"];
  		
  		if(!req.body.userdata.email || req.body.userdata.email.length == 0)
  		{
  		    return res.send({status:'failure',msg:'Email of the user should be provided'});
  		}
  	
  		uid = req.body.uid;
  		
  		visitorDetail["_id"] = uid;
        visitorDetail["appid"] = req.body.appid;
  		
  		if(!sessioncookie)
  		{
  			sessionDetail["sessionid"] = utils.guidGenerator();
  		}
  		else
  		{
  			sessionDetail["sessionid"] = sessioncookie;
  		}
  		
  		
  		
  		
  		var browserInfo = new BrowserInfo();
  		var geolocation = new GeoLocation();
  		var visitorMetaInfo = new VisitorMetaInfo();
  		
  		browserInfo.browser = agent.browser;
  		browserInfo.version =  agent.version;
  		browserInfo.os =  agent.os;
  		browserInfo.platform= agent.platform;
  		browserInfo.browserlanguage = req.headers["accept-language"].split(',')[0];
        browserInfo.screenresolution = req.body.screenresolution;
        browserInfo.timezone = req.body.timezone;
        browserInfo.rawagentdata = agent.source;
        browserInfo.sessionstart = req.body.sessionstart;

        if(agent.isDesktop)
        {
  		    browserInfo.device= "Desktop";
        }
        else if(agent.isTablet)
        {
  		    browserInfo.device= "Tablet";
        }
        else if(agent.isMobile)
        {
  		    browserInfo.device= "Mobile";
        }
        //Laptop not available with the agent library, clubbed with desktop

        var ipAddress = req.header('x-forwarded-for') || req.connection.remoteAddress;
        var locationInfo = geoip.lookup(ipAddress);

        geolocation.city = "";
        geolocation.country = "";
        geolocation.region = "";
        geolocation.timezone = "";

        if(locationInfo != null)
        {
            geolocation.city = locationInfo.city;
            geolocation.country = locationInfo.country;
            geolocation.region = locationInfo.region;
        }
  		
		sessionDetail["agentinfo"]  = browserInfo;
  		sessionDetail["geolocationinfo"]  = geolocation;
  		sessionDetail["visitorid"]  = uid;
  		sessionDetail["ipaddress"]  = ipAddress;
  		visitorDetail["visitordata"]  = req.body.userdata;
  		
  		
  		// Get the documents collection
        var visitorCollection = global.db.collection('visitors');

        var status = "success";
        
        visitorCollection.findOne({ "visitordata.email": req.body.userdata.email },function(err,visitor)
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
      	  			res.cookie('usercomio_session',sessionDetail["sessionid"], { httpOnly: true });
	      		}
      	  		
      		  	var lastseen = new Date();
      		  	
      		  	
      		  	for(var key in req.body.userdata)
      		  	{
      		  		visitorDetail["visitordata"][key] = req.body.userdata[key];
      		  	}
      		  	
  		  		visitorCollection.update({_id:visitor._id},{$set:{'visitormetainfo.lastseen':lastseen,visitordata:visitorDetail["visitordata"]}},function(err,count,result)
	      		{
	  		  		if (err)
	  	            {
	  	            	return res.send({status:'failure'});
	  	            }
	      		});

                sessionDetail["visitorid"]  = visitor._id;
      	  }
      	  else
      	  {
      		visitorMetaInfo.firstseen = new Date();
      		visitorMetaInfo.lastseen = new Date();
      		
      		visitorDetail["visitormetainfo"]  = visitorMetaInfo;  
      		
      		res.cookie('usercomio_session',sessionDetail["sessionid"], { httpOnly: true });
      		
      		visitorCollection.insert([visitorDetail], function (err, result) 
                {
      	            if (err)
      	            {
      	            	res.status(500);
      	      		  	return res.send({status:'failure'});
      	            }
      	            
      	           
      	        });
      	  }

            var sessionCollection = global.db.collection('sessions');

      		sessionCollection.insert([sessionDetail], function (err, result) {

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

  	/*
  	 * @desc Handle the logout call from client
  	 */
  	handleLogout(req,res)
  	{

        var sessionCollection = global.db.collection('sessions');

        sessionCollection.aggregate([
            {
              $lookup:
                {
                  from: "visitors",
                  localField: "visitorid",
                  foreignField: "_id",
                  as: "visitors"
                }
            },
            { $match :
                { "$and": [
                    { "agentinfo.sessionstart" : req.body.sessionstart},
                    { "visitors.visitordata.email" : req.body.userdata.email }
                  ]
                }
            }
        ]).toArray(function(err,session)
        {
            if(err)
            {
      		    res.status(500);
                return res.send({status:'failure'});
            }

            if(session)
            {
                sessionCollection.update(
                    { _id: session[0]._id },
                    { $set :
                        {
                            "agentinfo.sessionend": new Date()
                        }
                    },
                    { upsert: true }
                );
            }

        });


  	}
  
  	
}


module.exports.VisitorTrackingManager = VisitorTrackingManager;
