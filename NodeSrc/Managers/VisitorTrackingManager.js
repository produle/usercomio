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

class VisitorTrackingManager {

  constructor()
    {

        this.app = app;
        
        this.app.use(cors())
        this.app.use(useragent.express());
        this.router = express.Router(); 

        
        this.router.post("/ping",(req, res) => { this.handlePing(req,res); });
        
    }
  	
  	/*
  	 * @desc Handle inital ping that happens when page loads or when the script is initialized
  	 */
  	handlePing(req,res)
  	{
  		var agent = req.useragent;
  		
  		var visitorDetail = {};
  		
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
  		
  		visitorDetail["_id"] = uid;
  		
  		var browserInfo = new BrowserInfo();
  		var geolocation = new GeoLocation();
  		var visitorMetaInfo = new VisitorMetaInfo();
  		
  		browserInfo.browser = agent.browser;
  		browserInfo.version =  agent.version;
  		browserInfo.os =  agent.os;
  		browserInfo.platform= agent.platform;
  		
  		visitorMetaInfo.firstseen = new Date();
  		visitorMetaInfo.lastseen = new Date();
  		visitorMetaInfo.websessions = 0;
		
  		visitorDetail["agentinfo"]  = browserInfo;
  		visitorDetail["geolocationinfo"]  = geolocation;
  		visitorDetail["visitormetainfo"]  = visitorMetaInfo;
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
      		  console.log(visitor.visitormetainfo.websessions);
      		  	var websession = Number(visitor.visitormetainfo.websessions) + 1;
      		  	var lastseen = new Date();
      		  	
      		  	
      		  	for(var key in req.body.userdata)
      		  	{
      		  		visitorDetail["visitordata"][key] = req.body.userdata[key];
      		  	}
      		  	
  		  		visitorCollection.update({_id:uid},{$set:{'visitormetainfo.websessions':websession,'visitormetainfo.lastseen':lastseen,visitordata:visitorDetail["visitordata"]}},function(err,count,result)
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
  
  	
}


module.exports.VisitorTrackingManager = VisitorTrackingManager;
