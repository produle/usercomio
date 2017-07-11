/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the App related code example create new app curd operations
 *
 */

var express = require("express");
var app = require("../server").app;
var fs = require("fs");
var path = require('path');
var uglify = require("uglify-js"); 
const { URL } = require('url');
var EmailManager = require("./EmailManager").EmailManager;
var BrowserNotificationManager = require("./BrowserNotificationManager").BrowserNotificationManager;

class AppManager {

  constructor()
    {

        this.app = app;
        this.router = express.Router();
        
        this.router.post("/createNewApp",(req, res) => { this.createNewApp(req,res); });
        this.router.post("/getAllUserApps",(req, res) => { this.getAllUserApps(req,res); });
        this.router.post("/updateAnAppDetails",(req, res) => { this.updateAnAppDetails(req,res); });
        this.router.post("/deleteAnApp",(req, res) => { this.deleteAnApp(req,res); });
        this.router.post("/regeneratetrackjs",(req, res) => { this.regenerateTrackjs(req,res); });
    }
  	
  	/*
  	 * @desc Returns all apps 
  	 */
  	getAllUserApps(req,res)
  	{
  		if(!req.isAuthenticated())
        {
            return res.send({status:'authenticationfailed'});
        }

        var appCollection = global.db.collection('apps');
  		var user = req.body.user;
        
        //Currently obtaining App list by company as specifics roles are not available
        appCollection.find({/*creator:user.username,*/clientId:user.company}).toArray(function(err,apps)
        {
      	  if(err)
      	  {
      		  res.status(500);
      		  return res.send({status:'failure'});
      	  }
      	  
      	  if(apps)
      	  {
            	return res.send({status:apps});
      	  }
        
        });
  	}
  
  	/*
  	 * @desc Creates a new app
  	 */
  	createNewApp(req,res)
  	{
        var config = require('config');

  		if(config.has("setupCompleted") && config.get("setupCompleted") == 1 && !req.isAuthenticated())
        {
            return res.send({status:'authenticationfailed'});
        }

        // Get the documents collection
        var userCollection = global.db.collection('users');
        var appCollection = global.db.collection('apps');

        var user = req.body.user;
        var newApp = req.body.newApp;
        
        newApp._id = newApp._id;
        newApp.createDate = new Date();
        
        var status = "success";
        
        appCollection.findOne({ name: newApp.name },function(err,app)
        {
      	  if(err)
      	  {
      		  res.status(500);
      		  return res.send({status:'failure'});
      	  }
      	  
      	  if(app)
      	  {
            	return res.send({status:'appexists'});
      	  }
      	  else
      	  {
              userCollection.findOne({ _id: user._id },function(err,userObj)
              {
                  if (err)
                  {
                        res.status(500);
                        return res.send({status:'failure'});
                  }

                  newApp.clientId = userObj.company;

                  appCollection.insert([newApp], function (err, result)
                    {
                        if (err)
                        {
                            res.status(500);
                            return res.send({status:'failure'});
                        }
                        else
                        {
                            var emailSettings = {
                                    emailType : "SMTP",
                                    smtp: {
                                      host : "",
                                      port : "",
                                      user : "",
                                      pass : "",
                                    },
                                    appId : newApp._id
                                };

                            var EmailManagerObj = new EmailManager();
                            EmailManagerObj.addEmailSettings(user, emailSettings,function(){

                            });

                            var browserNotificationSettings = {
                                    fcmKey : "",
                                    fcmSenderId : "",
                                    fcmAppName : "",
                                    icon : "",
                                    appId : newApp._id
                                };

                            var BrowserNotificationManagerObj = new BrowserNotificationManager();
                            BrowserNotificationManagerObj.addBrowserNotificationSettings(user, browserNotificationSettings,function(){

                            });

                            var appManagerObj = new AppManager();
                            appManagerObj.generateTrackingCodeForApp(newApp._id);
                            
                            return res.send({status:newApp});
                            
                        }


                    });
              });
      	  }
      	  
      });
  	}
  	
  	/*
  	 * @desc Updates the app information
  	 */
  	updateAnAppDetails(req,res)
  	{
  		if(!req.isAuthenticated())
        {
            return res.send({status:'authenticationfailed'});
        }

        var appCollection = global.db.collection('apps');
  		
  		var appinfo = req.body.app;
  		
  		
  		appCollection.findOne({ name: appinfo.name },function(err,app)
  		{
  				  if(err)
  		      	  {
  		      		  res.status(500);
  		      		  return res.send({status:'failure'});
  		      	  }
  		      	  
  		      	  if(app)
  		      	  {
  		            	return res.send({status:'appexists'});
  		      	  }
  		      	  else
  		      	  {
  		      		appCollection.update({_id:appinfo._id},{$set:{name:appinfo.name}},function(err,count,result)
  		      		{
  		    			    if(err)
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
        
  		});
      
  	}
  	
	/*
  	 * @desc Deletes an app entry
  	 */
  	deleteAnApp(req,res)
  	{
  		if(!req.isAuthenticated())
        {
            return res.send({status:'authenticationfailed'});
        }

        var appinfo = req.body.app;

        global.db.collection('apps').count({},function(error, numOfApps) {
            if(numOfApps > 1)
            {
                //Delete messages of the app
                global.db.collection('messages').remove({appId:appinfo._id},function(err,numberOfRemovedDocs)
                {
                     if(err)
                    {
                          console.log(err);
                    }
                });

                //Delete emailtemplates of the app
                global.db.collection('emailtemplates').remove({appId:appinfo._id},function(err,numberOfRemovedDocs)
                {
                     if(err)
                    {
                          console.log(err);
                    }
                });

                //Delete browsernotificationtemplates of the app
                global.db.collection('browsernotificationtemplates').remove({appId:appinfo._id},function(err,numberOfRemovedDocs)
                {
                     if(err)
                    {
                          console.log(err);
                    }
                });

                //Delete filters of the app
                global.db.collection('filters').remove({appId:appinfo._id},function(err,numberOfRemovedDocs)
                {
                     if(err)
                    {
                          console.log(err);
                    }
                });

                //Delete sessions of the app
                global.db.collection('sessions').remove({appId:appinfo._id},function(err,numberOfRemovedDocs)
                {
                     if(err)
                    {
                          console.log(err);
                    }
                });

                //Delete visitors of the app
                global.db.collection('visitors').remove({appId:appinfo._id},function(err,numberOfRemovedDocs)
                {
                     if(err)
                    {
                          console.log(err);
                    }
                });

                //Delete from app of the app
                global.db.collection('apps').remove({_id:appinfo._id},function(err,numberOfRemovedDocs)
                {
                     if(err)
                    {
                          console.log(err);
                    }
                });

                //Delete emailsettings of the app
                global.db.collection('emailsettings').remove({appId:appinfo._id},function(err,numberOfRemovedDocs)
                {
                     if(err)
                    {
                          console.log(err);
                    }
                });

                //Delete browsernotificationsettings of the app
                global.db.collection('browsernotificationsettings').remove({appId:appinfo._id},function(err,numberOfRemovedDocs)
                {
                     if(err)
                    {
                          console.log(err);
                    }
                });

                return res.send({status:'success'});
            }
            else
            {
                return res.send({status:'defaultapp'});
            }
        });



  	}
  	
  	/*
  	 * @desc Generates tracking code for each app based on services enabled for it
  	 */
  	generateTrackingCodeForApp(appId)
  	{
  		var out = "Add Base URL";
        var config = require('config');
        var trackjscode = "";

		if(config.has("baseURL"))
        {
            var baseTrackingCodePath = path.join(__dirname, '/../../WebContent/js/src/internal/tracking');
            
            var uglified = uglify.minify([baseTrackingCodePath+'/utils.js', baseTrackingCodePath+'/usercomio-core.js', baseTrackingCodePath+'/eventtrack-service.js',baseTrackingCodePath+'/browsernotification-service.js']);

            out = uglified.code;
           
            out = out.replace("VARIABLE_APPID", appId);
            
            out = out.replace("VARIABLE_BASEURL", config.get("baseURL"));
            
            var apiBaseUrl = new URL(config.get("baseURL"));
            
            out = out.replace("VARIABLE_APIHOST",apiBaseUrl.hostname)
            
            //We can get the particular service a user has and add it.This gets executed after browser parses the script.
            //Services are started after ping call inside UserCom.init().
            out = out +  "SERVICES.push('trackElement,')";
            
            var trackjsFolderPath = path.join(__dirname, '/../../trackjs');

            if (!fs.existsSync(trackjsFolderPath)){
                fs.mkdirSync(trackjsFolderPath);
            }
            
            fs.writeFile(trackjsFolderPath+'/track-'+appId+'.min.js',out,  function (err){
	            if(err) {
            	    console.log(err);
            	  } else {
            	    console.log("Trackjs script generated for appId:"+appId);
            	  }      
            	});
        }
	  };      	


    /*
     * @desc
     */
    regenerateTrackjs(req,res)
    {
        //TODO Authentication is skipped as server restarts when config file is changed
//        if(!req.isAuthenticated())
//        {
//            return res.send({status:'authenticationfailed'});
//        }

        var appId = req.body.appId;

        if(appId != null)
        {

            this.generateTrackingCodeForApp(appId);

        }
        else
        {

            //Regenerate tracking code for all the app
            var appManagerObj = global.controllerList["AppManager"];
            var appCollection = global.db.collection('apps');

            //Obtaining App list
            appCollection.find().toArray(function(err,apps)
            {
                if(err)
                {
                    console.log("ERROR:"+err);
                }

                if(apps)
                {
                    for(var i = 0 ; i < apps.length; i++)
                    {
                        appManagerObj.generateTrackingCodeForApp(apps[i]._id);
                    }
                }
            });
        }

        return res.send({status:'success'});
    }
}



module.exports.AppManager = AppManager;
