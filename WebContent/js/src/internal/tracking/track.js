/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Tracking code tracks user and browser information
 *
 */
 

(function (window,document)
{
	"use strict";
	
	var thisClass = this;
	
	var HTTP_PROTOCOL = (('https:' === document.location.protocol) ? 'https://' : 'http://');

	/*
	 * Module level globals
	 */
	var DEFAULT_CONFIG = 
	{
			'api_host':   HTTP_PROTOCOL + 'localhost:3000',
	}
	
	var utils = 
	{
			guidGenerator: function()
		    {
		        var S4 = function() {
		           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		        };
		        return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
		    },
			extendObj : function(parentObj,childObject) {
				   for (var i in childObject) {
				      if (childObject.hasOwnProperty(i)) {
				    	  parentObj[i] = childObject[i];
				      }
				   }
				   
				   return parentObj;
			}
	};
	
	var cookie = 
	{
			 createCookie : function(name,value,days) {
			    var expires = "";
			    if (days) {
			        var date = new Date();
			        date.setTime(date.getTime() + (days*24*60*60*1000));
			        expires = "; expires=" + date.toUTCString();
			    }
			    document.cookie = name + "=" + value + expires + "; path=/";
			},

			 readCookie : function(name) {
			    var nameEQ = name + "=";
			    var ca = document.cookie.split(';');
			    for(var i=0;i < ca.length;i++) {
			        var c = ca[i];
			        while (c.charAt(0)==' ') c = c.substring(1,c.length);
			        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
			    }
			    return null;
			},

			 eraseCookie: function(name) 
			 {
			    createCookie(name,"",-1);
			 }

	};
	
	/*
	 * AJAX Utility
	 */
	var xhr = {
			
				/**
				 * IE 5.5+, Firefox, Opera, Chrome, Safari XHR object
				 * Send Ajax Request in form encoded format
				 * @param string url
				 * @param function callback
				 * @param mixed data
				 */
				formdata : function(url,data,callbacl)
				{
					try {
						var x = new XMLHttpRequest();
						x.open(data ? 'POST' : 'GET', url, 1);
						x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
						x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
						x.onreadystatechange = function () {
							x.readyState > 3 && callback && callback(x.responseText, x);
						};
						x.send(data)
					} 
					catch (e) 
					{
						window.console && console.log(e);
					}
				},
				
				/**
				 * IE 5.5+, Firefox, Opera, Chrome, Safari XHR object
				 * Send Ajax Request in JSON format
				 * @param string url
				 * @param function callback
				 * @param mixed data
				 */
				raw :function(url, data,callback)
				{
					try {
						var x = new XMLHttpRequest ();
						x.open(data ? 'POST' : 'GET', url, 1);
						x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
						x.setRequestHeader('Content-type', 'application/json');
						x.onreadystatechange = function () {
							x.readyState > 3 && callback && callback(x.responseText, x);
						};
						x.send(data)
					} 
					catch (e) 
					{
						window.console && console.log(e);
					}
				},
	};
	
	/*
	 * UserCom Library object
	 */
	var UsercomLib = {
			
			appid : null,
			
			userData : null,
			
			track : function(eventName,properties)
			{
				if(!eventName || eventName.length == 0)
				{
					console.error("Usercom Error: Event name not provided !");
					return;
				}
				
				var requestObj = {
						appid : this.appid,
						userdata : this.userData,
						properties:properties,
						eventname:eventName,
						uid:utils.guidGenerator()
				}
				
				xhr.raw(DEFAULT_CONFIG.api_host+'/VisitorTrackingManager/event', JSON.stringify(requestObj),function(data){
					console.log(data);
				})
			}
			
	};
	
	var Usercom = {
			
			init : function(appid,userComSettings)
			{
				if(!appid || appid.length ==0)
				{
					console.error("Usercom Error: Invalid app id !");
					return;
				}
				
				var userComSettings = userComSettings || {};
				
				UsercomLib["appid"] = appid;
				UsercomLib["userData"] = userComSettings;
				
				var requestObj = {
						appid : appid,
						userdata : userComSettings,
						uid:utils.guidGenerator()
				}
				
				xhr.raw(DEFAULT_CONFIG.api_host+'/VisitorTrackingManager/ping', JSON.stringify(requestObj),function(data){
					console.log(data);
				})
				
				window.Usercom = UsercomLib;
				
				if(!cookie.readCookie("usercomio_session"))
				{
					cookie.createCookie("usercomio_session",utils.guidGenerator());
				}
				
				this.bindGlobalErrorHandler(UsercomLib);
				
			},
			
			bindGlobalErrorHandler : function(UsercomLib)
			{
				var oldOnError = window.onerror;

				window.onerror = function(msg, url, lineNo, columnNo, error)
				{
					if(oldOnError) oldOnError.apply(this, arguments);	// Call any previously assigned handler
					
					 var message = [
					                'Message: ' + msg,
					                'URL: ' + url,
					                'Line: ' + lineNo,
					                'Column: ' + columnNo,
					                'Error object: ' + JSON.stringify(error)
					            ].join(' - ');


					var requestObj = {
							appid : UsercomLib.appid,
							userdata : UsercomLib.userData,
							errormsg : message,
							uid:utils.guidGenerator()
					}
					
					xhr.raw(DEFAULT_CONFIG.api_host+'/VisitorTrackingManager/error', JSON.stringify(requestObj),function(data){
						console.log(data);
					});
					
					return false;
				}
			}
	}
	
	
	window.Usercom = Usercom;
	
	
	
	
	
})(window,document);

