/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the login related code example forget pass,user login etc
 *
 */
var express = require("express");
var app = require("../server").app;
var passport = require("../server").passport;


class LoginManager {


    constructor(basePath)
    {

        this.app = app;
        this.passport = passport;

        this.router = express.Router();

        // Route definitions for this controller
        this.router.post("/validateUser", (req,res) => { this.validateUser(req,res) });
        
        
    }

    /*
     * @desc - Validates User Login, input username and password
     * it returns true of user object is user is valid
     */
    validateUser(req,res)
    {
    	this.passport.authenticate('local', function(err, user) 
    		{
	             if (err)
	             {
	               return res.json({ error : err.message });
	             }
	            if (!user)
	             {
	               return res.json({error : "Invalid Login"});
	             }
           
		        req.login(user, {}, function(err)
	            {
	              if (err) 
	              { 
	            	  return res.json({error:err});
	              }
	              return res.cookie('uname',user.username,{ maxAge: 900000, httpOnly: true }).cookie('token',user.password,{ maxAge: 900000, httpOnly: true }).cookie('logingood',true,{ maxAge: 900000, httpOnly: true }).json(user);
	            })
            
      })(req, res);
  
    }

}

module.exports.LoginManager = LoginManager;
