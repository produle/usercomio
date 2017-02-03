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
	}
	
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
	}
	
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
				
			}
			
	}
	
	/*
	 * 
	 */
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
						platform : "web",
						uid : utils.guidGenerator()
				}
				
				xhr.raw(DEFAULT_CONFIG.api_host+'/VisitorTrackingManager/ping', JSON.stringify(requestObj),function(data){
					console.log(data);
				})
				
				window.Usercom = UsercomLib;
				
				
			}
	}
	
	
	window.Usercom = Usercom;
	
	
	
})(window,document);

