/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Contains end points accessed by the users and renders respective views
 *
 */

var express = require("express");
var app = require("./server").app;
var userManager = require("./Managers/UserManager").UserManager;

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
                            res.render('index',{user:user})
                        })
                    }
                    else
                    {
                        res.redirect('login');
                    }
                }
                else
                {
                    res.redirect('login');
                }
            }
            else {
                res.redirect('setup');
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
		 * @desc Renders edit profile page
		 */
		app.get('/edit-profile', function(req, res)
		{

            if (req.isAuthenticated())
            {
                var uname = req.cookies.uname;
                if(uname)
                {

                    var userManagerObj = new userManager();

                    var user = userManagerObj.getUserByUsername(uname,function(user){
                        res.render('editprofile',{user:user})
                    })
                }
                else
                {
                    res.redirect('login');
                }
            }
            else
            {
                res.redirect('login');
            }


		 });

		/*
		 * @desc Renders change password page
		 */
		app.get('/change-password', function(req, res)
		{

            if (req.isAuthenticated())
            {
                var uname = req.cookies.uname;
                if(uname)
                {

                    var userManagerObj = new userManager();

                    var user = userManagerObj.getUserByUsername(uname,function(user){
                        res.render('changepassword',{user:user})
                    })
                }
                else
                {
                    res.redirect('login');
                }
            }
            else
            {
                res.redirect('login');
            }


		 });

		/*
		 * @desc Renders edit email settings page
		 */
		app.get('/edit-smtp', function(req, res)
		{

            if (req.isAuthenticated())
            {
                var uname = req.cookies.uname;
                if(uname)
                {

                    var userManagerObj = new userManager();

                    var config = require('config');

                    var user = userManagerObj.getUserByUsername(uname,function(user){
                        res.render('editsmtp',{user:user,config:config})
                    })
                }
                else
                {
                    res.redirect('login');
                }
            }
            else
            {
                res.redirect('login');
            }


		 });

		/*
		 * @desc Renders edit database settings page
		 */
		app.get('/edit-database', function(req, res)
		{

            if (req.isAuthenticated())
            {
                var uname = req.cookies.uname;
                if(uname)
                {

                    var userManagerObj = new userManager();

                    var config = require('config');

                    var user = userManagerObj.getUserByUsername(uname,function(user){
                        res.render('editdatabase',{user:user,config:config})
                    })
                }
                else
                {
                    res.redirect('login');
                }
            }
            else
            {
                res.redirect('login');
            }


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


	}
	
}


module.exports.ViewRenderer = ViewRenderer;
