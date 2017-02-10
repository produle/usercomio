/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the login related code example forget pass,user login etc
 *
 */
var express = require("express");
var app = require("../server").app;
var passport = require("../server").passport;
var utils = require("../core/utils").utils;


class LoginManager {


    constructor(basePath)
    {

        this.app = app;
        this.passport = passport;

        this.router = express.Router();

        // Route definitions for this controller
        this.router.post("/validateUser", (req,res) => { this.validateUser(req,res) });
        this.router.post("/forgotPassword", (req,res) => { this.forgotPassword(req,res) });
        this.router.post("/resetPassword", (req,res) => { this.resetPassword(req,res) });
                
        
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
    
    /*
     * @desc Handles forgot password and inserts the token that was sent by email
     */
    forgotPassword(req,res)
    {
    	 // Get the documents collection
        var userCollection = global.db.collection('users');

        var email = req.body.email;
        var token = req.body.token;
        
        userCollection.findOne({ _id: email },function(err,user)
        {
      	  if(err)
      	  {
      		  return res.send({status:"failure"})
      	  }
      	  
      	  if(user)
      	  {
      		    userCollection.update({_id:email},{$set:{token:token}},function(err,count,result)
	      		{
      		    	if(err)
      		    	{
      		    		 return res.send({status:"failure"})
      		    	}
      		    	
      		    	 return res.send({status:"success"});
	      		})
      	  }
        });
    }
    
    /*
     * @desc Updates the new password
     */
    resetPassword(req,res)
    {
    	 // Get the documents collection
        var userCollection = global.db.collection('users');

        var password = req.body.password;
        var token = req.body.token;
        
        userCollection.findOne({ token: token },function(err,user)
        {
      	  if(err)
      	  {
      		  return res.send({status:"failure"})
      	  }
      	  
      	  if(user)
    	  {
    		    userCollection.update({ _id: user._id },{$set:{token:null,password:utils.encrypt(password)}},function(err,count,result)
	      		{
    		    	if(err)
    		    	{
    		    		 return res.send({status:"failure"})
    		    	}
    		    	
    		    	 return res.send({status:"success"});
	      		})
    	  }
      	  
        });
    }

}

module.exports.LoginManager = LoginManager;
