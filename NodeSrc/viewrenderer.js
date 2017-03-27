/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Contains end points accessed by the users and renders respective views
 *
 */

var express = require("express");
var moment = require("moment");
var app = require("./server").app;
var userManager = require("./Managers/UserManager").UserManager;
var visitorListManager = require("./Managers/VisitorListManager").VisitorListManager;

class ViewRenderer
{
	constructor()
	{
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
                            res.render('index',{user:user,config:config})
                        })
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
            res.render('setup');
		});

		/*
		 * @desc Renders user profile page
		 */
		app.get('/visitor/:visitorid', function(req, res)
		{

            var config = require('config');

            if(config.has("database")) {

                if (req.isAuthenticated())
                {
                    var uname = req.cookies.uname;
                    if(uname)
                    {

                        var userManagerObj = new userManager();

                        var visitorListManagerObj = new visitorListManager();

                        var user = userManagerObj.getUserByUsername(uname,function(user){

                            visitorListManagerObj.getVisitorById(req.params.visitorid,function(visitors){

                                if(visitors.length > 0)
                                {
                                    res.render('visitor',{user:user,config:config,moment:moment,visitor:visitors[0]});
                                }
                                else
                                {
                                    res.redirect('/');
                                }
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


	}
	
}


module.exports.ViewRenderer = ViewRenderer;
