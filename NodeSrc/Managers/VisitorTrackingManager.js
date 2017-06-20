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
var RTCManager = require("./RTCManager").RTCManager;

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
        this.router.post("/register",(req, res) => { this.handleRegistration(req,res); });
        
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

  		if(!sessioncookie)
  		{
  			sessionDetail["_id"] = utils.guidGenerator();
  		}
  		else
  		{
  			sessionDetail["_id"] = sessioncookie;
  		}

        visitorDetail["_id"] = uid;
        visitorDetail["appId"] = req.body.appid;
  		
  		
  		var browserInfo = new BrowserInfo();
  		var geolocation = new GeoLocation();
  		var visitorMetaInfo = new VisitorMetaInfo();
  		
  		browserInfo.browser = agent.browser;
  		browserInfo.version =  agent.version;
  		browserInfo.os =  agent.os;
  		browserInfo.platform= agent.platform;
  		browserInfo.browserLanguage = req.headers["accept-language"].split(',')[0];
        browserInfo.screenResolution = req.body.screenResolution;
        browserInfo.timezone = req.body.timezone;
        browserInfo.rawAgentData = agent;
        browserInfo.rawAgentSource = agent.source;
        browserInfo.sessionStart = new Date();

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
  		
		sessionDetail["agentInfo"]  = browserInfo;
  		sessionDetail["geoLocationInfo"]  = geolocation;
  		sessionDetail["visitorId"]  = uid;
  		sessionDetail["ipAddress"]  = ipAddress;
  		visitorDetail["visitorData"]  = req.body.userdata;
  		
  		
  		// Get the documents collection
        var appCollection = global.db.collection('apps');
        var visitorCollection = global.db.collection('visitors');

        var status = "success";
        
        appCollection.findOne({ _id: req.body.appid },function(err,app)
        {
            if(err)
            {
                res.status(500);
                return res.send({status:'failure'});
            }

            if(app)
            {
                sessionDetail["appId"]  = app._id;
                sessionDetail["clientId"]  = app.clientId;
                visitorDetail["clientId"]  = app.clientId;

                visitorCollection.findOne({ "visitorData.email": req.body.userdata.email, appId: req.body.appid },function(err,visitor)
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
                            res.cookie('usercomio_session',sessionDetail["_id"], { httpOnly: true });
                        }

                        var lastSeen = new Date();


                        for(var key in req.body.userdata)
                        {
                            visitorDetail["visitorData"][key] = req.body.userdata[key];
                        }

                        visitorCollection.update({_id:visitor._id},{$set:{'visitorMetaInfo.lastSeen':lastSeen,visitorData:visitorDetail["visitorData"]}},function(err,count,result)
                        {
                            if (err)
                            {
                                return res.send({status:'failure'});
                            }
                        });

                        sessionDetail["visitorId"]  = visitor._id;
                        visitorDetail["_id"] = visitor._id;
                  }
                  else
                  {
                    visitorMetaInfo.firstSeen = new Date();
                    visitorMetaInfo.lastSeen = new Date();

                    visitorDetail["visitorMetaInfo"]  = visitorMetaInfo;

                    res.cookie('usercomio_session',sessionDetail["_id"], { httpOnly: true });

                    visitorCollection.insert([visitorDetail], function (err, result)
                        {
                            if (err)
                            {
                                res.status(500);
                                return res.send({status:'failure'});
                            }

                            
                            var rtcManager = new RTCManager();
                        	rtcManager.newVisitor(visitorDetail);
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
                        	return res.send({status:visitorDetail,sessionId:sessionDetail["_id"]});

                        }

                        	
                    });

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
  		
  		var sessionId;
  		
  		if(!req.body.userdata.email || req.body.userdata.email.length == 0)
  		{
  			if(!req.body.userdata.userid || req.body.userdata.userid.length == 0)
  			{
  				return res.send({status:'failure',msg:'Either email or userid should be provided'})
  			}
  			else
  			{
  				sessionId = req.body.sessionId
  			}
  		}
  		else
  		{
  			sessionId = req.body.sessionId;
  		}
  		 
  		var visitorEventDetail = {};
  		
  		visitorEventDetail["_id"] = utils.guidGenerator();
  		visitorEventDetail["appId"] =  req.body.appid;
  		visitorEventDetail["createDate"] = new Date();
  		visitorEventDetail["sessionId"]  = sessionId;
  		visitorEventDetail["eventName"] = req.body.eventname;
  		visitorEventDetail["eventProperties"] = req.body.properties;
  		visitorEventDetail["visitorId"]  = req.body.visitorId;
 
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
  		
  		visitorPageErrorDetail["_id"] =  req.cookies["usercomio_session"];
  		visitorPageErrorDetail["appId"] =  req.body.appid;
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
                  localField: "visitorId",
                  foreignField: "_id",
                  as: "visitors"
                }
            },
            { $match :
                { "$and": [
                    { "_id" : req.body.sessionId},
                    { "visitors.visitorData.email" : req.body.userdata.email }
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

            if(session && session.length == 1)
            {
                sessionCollection.update(
                    { _id: session[0]._id },
                    { $set :
                        {
                            "agentInfo.sessionEnd": new Date()
                        }
                    },
                    { upsert: true }
                );
            }

        });


  	}

  	/*
  	 * @desc Handle the Registration of service worker
  	 */
  	handleRegistration(req,res)
  	{
        var sessionId = req.body.sessionId;

        var notification = {
            endpoint: req.body.endpoint,
            p256dh: req.body.p256dh,
            auth: req.body.auth
        };

        var sessionCollection = global.db.collection('sessions');

        sessionCollection.update(
            { _id:  sessionId},
            { $set :
                {
                    notification: notification
                }
            },
            { upsert: true },
            function(updateErr)
            {
                if(updateErr)
                {
                    res.status(500);
                    return res.send({status:'failure'});
                }
                else
                {
                    res.send({status:"success"});
                }
            }
        );


  	}
  
  	
}


module.exports.VisitorTrackingManager = VisitorTrackingManager;
