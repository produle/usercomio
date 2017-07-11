/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Contains end points accessed by the users and renders respective views
 *
 */

var express = require("express");
var moment = require("moment");
var fs = require("fs");
var path = require('path');
var app = require("./server").app;
var uglify = require("uglify-js"); 
var userManager = require("./Managers/UserManager").UserManager;
var visitorListManager = require("./Managers/VisitorListManager").VisitorListManager;
var emailManager = require("./Managers/EmailManager").EmailManager;

class ViewRenderer
{
	constructor()
	{

        function isLoggedIn(req, res, next) {
            if (req.user) {
                next();
            } else {
                res.redirect('/login');
            }
        }

		/*
		 * @desc Renders Login Page
		 */
		app.get('/login',function(req,res){
			res.render('login');
		});
		
		/*
		 * @desc Renders Registration Page
		 */
		app.get('/register',function(req,res){
			res.render('userregistration');
		});
		
		/*
		 * @desc Renders main(index) page
		 */
		app.get('/', function(req, res)
		{


            var config = require('config');

            if(config.has("database")) {

                if (req.isAuthenticated())
                {
                    var uname = req.cookies.uname;
                    if(uname)
                    {

                        var userManagerObj = new userManager();

                        var user = userManagerObj.getUserByUsername(uname,function(user){
                            delete user.password; //To avoid the encrypted password transmitted to client

                            userManagerObj.getCompanyByID(user.company,function(company){

                                user.companyTimezone = null;
                                if(company)
                                {
                                    user.companyTimezone = company.timezone;
                                }
                                res.render('index',{user:user})
                            });

                        });
                    }
                    else
                    {
                        res.redirect('/login');
                    }
                }
                else
                {
                    res.redirect('/login');
                }
            }
            else {
                res.redirect('/setup');
            }


		 });

		 /*
		 * @desc Clears all cookies and renders login page
		 */
		app.get('/logout', function (req, res){
		  
			req.logOut();
			
			var cookie = req.cookies;
		    
			for (var prop in cookie) {
		        if (!cookie.hasOwnProperty(prop)) {
		            continue;
		        }    
		        res.cookie(prop, '', {expires: new Date(0)});
		    }
		    
		    res.render('login');
		  
		  
		});

		
		/*
		 * @desc Renders Password Reset Page
		 */
		app.get('/passwordreset',function(req,res){
			res.render('passwordreset');
		});
		
		/*
		 * @desc Renders Setup Page
		 */
		app.get('/setup',function(req,res){
            var config = require('config');

            if(config.has("setupCompleted") && (config.get("setupCompleted") == 1)) {
                res.redirect('/login');
            }
            res.render('setup');
		});

		/*
		 * @desc Renders user profile page
		 */
		app.get('/visitor/:visitorid', isLoggedIn, function(req, res)
		{

            var config = require('config');

            if(config.has("database")) {

                if (req.isAuthenticated())
                {
                    var uname = req.cookies.uname;
                    if(uname)
                    {

                        var userManagerObj = new userManager();

                        var user = userManagerObj.getUserByUsername(uname,function(user){

                            delete user.password; //To avoid the encrypted password transmitted to client
                            res.render('visitor',{user:user,moment:moment,visitorid:req.params.visitorid});

                        });
                    }
                    else
                    {
                        res.redirect('/login');
                    }
                }
                else
                {
                    res.redirect('/login');
                }
            }
            else {
                res.redirect('/setup');
            }


		 });

		/*
		 * @desc Renders unsubscribe page
		 */
		app.get('/unsubscribe/:appid/:visitorid', function(req, res)
		{

            if(req.params.appid != null && req.params.appid != "" && req.params.visitorid != null && req.params.visitorid != "")
            {
                var emailManagerObj = new emailManager();

                emailManagerObj.validateAppDetails(req.params.appid,req.params.visitorid,function(appDetails, visitorDetails){

                    if(appDetails)
                    {
                        res.render('unsubscribe',{confirmation:true,app:appDetails,visitor:visitorDetails});
                    }
                    else
                    {
                        res.redirect('/');
                    }
                });
            }
            else
            {
                res.redirect('/');
            }
		 });

		/*
		 * @desc Unsubscribes the email upon confirmation page
		 */
		app.post('/unsubscribe/:appid/:visitorid', function(req, res)
		{

            if(req.params.appid != null && req.params.appid != "" && req.params.visitorid != null && req.params.visitorid != "")
            {
                var emailManagerObj = new emailManager();

                emailManagerObj.validateAppDetails(req.params.appid,req.params.visitorid,function(appDetails, visitorDetails){

                    if(appDetails)
                    {
                        emailManagerObj.unsubscribeVisitorFromApp(appDetails,visitorDetails);
                        res.render('unsubscribe',{confirmation:false});
                    }
                    else
                    {
                        res.redirect('/');
                    }
                });
            }
            else
            {
                res.redirect('/');
            }
		 });

        app.get('/tracking/usercom-service-worker.js', function(req, res) {

            var out = "Add Base URL";
            var config = require('config');

  		    if(config.has("baseURL"))
            {
                out = 'importScripts("'+config.get("baseURL")+'/js/src/internal/tracking/usercom-service-worker.js");';
            }

            res.setHeader('Content-disposition', 'attachment; filename=usercom-service-worker.js');
            res.setHeader('Content-type', 'text/javascript');
            res.write(out);
            res.end();
        });

        app.get('/tracking/track.js', function(req, res) {

        	try
        	{
        		var trackjscode = fs.readFileSync(path.join(__dirname, '/../trackjs/','track-'+req.query.appid+'.min.js'),'utf8');
                
                res.setHeader('Content-type', 'text/javascript');
                
                res.write(trackjscode);
                
                res.end();
        	}
        	catch(err)
        	{
        		res.status(404).end();
        	}
        
            
        });


	}
	
}


module.exports.ViewRenderer = ViewRenderer;
