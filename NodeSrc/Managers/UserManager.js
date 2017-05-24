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
        this.router.post("/updateAppPreference",(req, res) => { this.updateAppPreference(req,res); });
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
                  var UserManagerObj = new UserManager();

                  UserManagerObj.getDefaultCompany(function(company){
                      newUser.company = company._id;
                      userCollection.insert([newUser], function (err, result)
                      {
                            if (err)
                            {
                                 status = "error";
                                 res.status(500);
                            }

                      });

                      //Inserting a row to usercompany table also
                      var userCompany = {
                          _id: utils.guidGenerator(),
                          company: newUser.company,
                          userId: newUser._id,
                          role: "Admin"
                      };

                      var userCompanyCollection = global.db.collection('usercompany');
                      userCompanyCollection.insert([userCompany], function (err, result)
                      {
                            if (err)
                            {
                                 status = "error";
                                 res.status(500);
                            }

                      });
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

                var userManagerObj = new UserManager();

                userManagerObj.databaseSetupImport();
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

        var configString = JSON.stringify(config, null, '\t');

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
        if(!req.isAuthenticated())
        {
            return res.send({status:'authenticationfailed'});
        }

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
        if(!req.isAuthenticated())
        {
            return res.send({status:'authenticationfailed'});
        }

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

  	/*
  	 * @desc Updates the user preference of the apps
  	 */
    updateAppPreference(req,res)
    {
        if(!req.isAuthenticated())
        {
            return res.send({status:'authenticationfailed'});
        }

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
                            app: updateUser.app
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
     * @desc Imports the initial data to the database
     */
    databaseSetupImport()
    {
        //Predefined filters
        var predefinedFilterArray = [
            {"_id":"1","name":"All Users","filter":null,"mongoFilter":"{}","createDate":{"date":"2017-03-16T06:43:41.723Z"},"creator":null,"appId":null},
            {"_id":"2","name":"New Users","filter":"{\"condition\": \"AND\", \"rules\": [ { \"id\": \"visitorMetaInfo.lastSeen\", \"field\": \"visitorMetaInfo.lastSeen\", \"type\": \"date\", \"input\": \"text\", \"operator\": \"greater_or_equal\", \"value\": \"2017/03/01\" } ], \"valid\": true}","mongoFilter":"{  \"$and\": [    {      \"visitorMetaInfo.lastSeen\": {        \"$gte\": \"2017/03/01\"      }    }  ]}","createDate":{"date":"2017-03-16T06:43:41.723Z"},"creator":null,"appId":null},
            {"_id":"3","name":"Slipping Away","filter":"{\"condition\": \"AND\", \"rules\": [ { \"id\": \"visitorMetaInfo.lastSeen\", \"field\": \"visitorMetaInfo.lastSeen\", \"type\": \"date\", \"input\": \"text\", \"operator\": \"greater_or_equal\", \"value\": \"2017/03/01\" } ], \"valid\": true}","mongoFilter":"{  \"$and\": [    {      \"visitorMetaInfo.lastSeen\": {        \"$gte\": \"2017/03/01\"      }    }  ]}","createDate":{"date":"2017-03-16T06:43:41.723Z"},"creator":null,"appId":null}
        ];

        var userCollection = global.db.collection('filters');
        userCollection.insertMany(predefinedFilterArray);
    };

    /*
     * @desc Return the default company, creates if not exist
     */
    getDefaultCompany(callback)
    {
        var companyCollection = global.db.collection('companies');

        companyCollection.findOne({},function(err,company)
        {
              if(err)
              {
                  status = "error";
                  res.status(500);
              }

              if(company)
              {
                  return callback(company);
              }
              else
              {
                  var newCompany = {
                      _id : 'C'+utils.guidGenerator(),
                      name: "Usercom",
                      createDate: new Date()
                  };

                  companyCollection.insert([newCompany], function (err, result)
                  {
                      if(err)
                      {
                             return callback(null);
                      }
                      else
                      {
                          return callback(newCompany);
                      }

                  });
              }

        });
    }

}

module.exports.UserManager = UserManager;
