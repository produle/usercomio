/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 * @desc Handles all the user registration related code example register new user etc
 */

var express = require("express");
var app = require("../server").app;
var passport = require("../server").passport;
var utils = require("../core/utils").utils;


class UserManager {

  constructor()
    {

        this.app = app;
        this.passport = passport;
        this.router = express.Router(); 

        
        this.router.post("/registerUser",(req, res) => { this.registerUser(req,res); });
    }

  	/*
  	 * @desc Registers a new user
  	 */
    registerUser(req,res)
    {
          // Get the documents collection
          var userCollection = global.db.collection('users');

          var newUser = req.body.user;
          
          newUser._id = newUser.username;
          newUser.createDate = new Date();
          newUser.password = utils.encrypt(newUser.password);
          
          var status = "success";
          
          userCollection.findOne({ _id: newUser.username },function(err,user)
          {
        	  if(err)
        	  {
        		  status = "error";
        		  res.status(500);
        	  }
        	  
        	  if(user)
        	  {
        		  status = "userexists";
        	  }
        	  else
        	  {
        		  userCollection.insert([newUser], function (err, result) 
                  {
        	            if (err)
        	            {
        	            	 status = "error";
        	            	 res.status(500);
        	            }
        	            
        	        });
        	  }
        	  
        	  
        	  res.send({status:status});
        	  res.end();
        	 
    	  });
          
    }
    
    /*
     * @desc Return a user by searching username
     */
    getUserByUsername(username,callback)
    {
    	if(username)
    	{
    		// Get the documents collection
            var userCollection = global.db.collection('users');
            
            userCollection.findOne({ _id: username },function(err,user)
            {
            		if(err)
                  	  {
                  		 return callback(null);
                  	  }
                  	  else
                  	  {
                  		  return callback(user);
                  	  }
                  	  
             });

    	}
    }

}

module.exports.UserManager = UserManager;
