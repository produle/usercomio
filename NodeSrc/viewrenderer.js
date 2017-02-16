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
		 })

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
		

	}
	
}


module.exports.ViewRenderer = ViewRenderer;
