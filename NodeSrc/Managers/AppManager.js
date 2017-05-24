/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the App related code example create new app curd operations
 *
 */

var express = require("express");
var app = require("../server").app;

class AppManager {

  constructor()
    {

        this.app = app;
        this.router = express.Router(); 

        
        this.router.post("/createNewApp",(req, res) => { this.createNewApp(req,res); });
        this.router.post("/getAllUserApps",(req, res) => { this.getAllUserApps(req,res); });
        this.router.post("/updateAnAppDetails",(req, res) => { this.updateAnAppDetails(req,res); });
        this.router.post("/deleteAnApp",(req, res) => { this.deleteAnApp(req,res); });
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
        
        appCollection.find({creator:user.username,clientId:user.company}).toArray(function(err,apps)
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

                return res.send({status:'success'});
            }
            else
            {
                return res.send({status:'defaultapp'});
            }
        });



  	}
}


module.exports.AppManager = AppManager;
