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
        this.router.post("/verifydbconnection",(req, res) => { this.verifyDBConnection(req,res); });
        this.router.post("/saveconfig",(req, res) => { this.saveConfig(req,res); });
        this.router.post("/saveUserProfile",(req, res) => { this.saveUserProfile(req,res); });
        this.router.post("/saveUserPassword",(req, res) => { this.saveUserPassword(req,res); });
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

  	/*
  	 * @desc Verifies the given database credentials by creating a connection
  	 */
    verifyDBConnection(req,res)
    {
        var dbhost = req.body.dbhost;
        var dbport = req.body.dbport;
        var dbuser = req.body.dbuser;
        var dbpass = req.body.dbpass;
        var dbname = req.body.dbname;

        var status = "failure";

        //lets require/import the mongodb native drivers.
        var mongodb = require('mongodb');

        //We need to work with "MongoClient" interface in order to connect to a mongodb server.
        var MongoClient = mongodb.MongoClient;

        var credentials = "";
        if(dbuser != "")
        {
            credentials = dbuser;
            if(dbpass != "")
            {
                credentials = credentials + ':' + dbpass;
            }
            credentials = credentials + '@';
        }

        // Connection URL. This is where your mongodb server is running.
        var url = 'mongodb://'+credentials+dbhost+':'+dbport+'/'+dbname;

        // Use connect method to connect to the Server
        MongoClient.connect(url, function (err, db) {
            if (err) {
                status = "failure";
                console.log(err);
            } else {
                status = "connected";
                global.db = db;
            }

            res.send({status:status});
        });



    }

  	/*
  	 * @desc Verifies the given database credentials by creating a connection
  	 */
    saveConfig(req,res)
    {
        var config = req.body.config;

        var configString = JSON.stringify(config);

        var fs = require('fs');
        var path = require("path");

        var configDir = path.join(__dirname,'..','..','config');

        if (!fs.existsSync(configDir)){
            fs.mkdirSync(configDir);
        }


        fs.writeFile(path.join(configDir,'default.json'), configString, 'utf8', function(err){
            if(err == null )
            {
                res.send({status:"success"});
            }
            else
            {
                console.log(err);

                res.send({status:"failure"});
            }
        });
    };

  	/*
  	 * @desc Updates the user profile
  	 */
    saveUserProfile(req,res)
    {
        // Get the documents collection
        var userCollection = global.db.collection('users');

        var updateUser = req.body.user;

        userCollection.findOne({ _id: updateUser.username },function(err,user)
        {
            if(err)
            {
                res.status(500);
                return res.send({status:'failure'});
            }

            if(user)
            {
                userCollection.update(
                    { _id:  user.username},
                    { $set :
                        {
                            firstName: updateUser.firstName,
                            lastName: updateUser.lastName
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
                )
            }
            else
            {
                res.status(500);
                return res.send({status:'failure'});
            }

        });

    };

  	/*
  	 * @desc Updates the user password
  	 */
    saveUserPassword(req,res)
    {
        // Get the documents collection
        var userCollection = global.db.collection('users');

        var updateUser = req.body.user;

        userCollection.findOne({ _id: updateUser.username },function(err,user)
        {
            if(err)
            {
                res.status(500);
                return res.send({status:'failure'});
            }

            if(user)
            {
                userCollection.update(
                    { _id:  user.username},
                    { $set :
                        {
                            password: utils.encrypt(updateUser.password)
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
                )
            }
            else
            {
                res.status(500);
                return res.send({status:'failure'});
            }

        });

    };

}

module.exports.UserManager = UserManager;
