/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Tracking core code which initializes the scripts.
 *
 */
 

	/*
	 * Module level globals
	 */
	var DEFAULT_CONFIG = 
	{
			'api_baseurl':   'VARIABLE_BASEURL',
			'api_host': 'VARIABLE_APIHOST',
            'serviceWorkerFile' : '/usercom-sw.js'
	}
	
	var SERVICES = ["trackEvent"]
	
	var Usercom = {

			props : {
				  sessionId : null,
		          visitorId : null,
		          appid:null,
			},
           
			//This function is called for first.We give this function to user to inject in their code.
			init : function(userComSettings)
			{
                var appid = "VARIABLE_APPID";
                var thisClass = this;

				if(!appid || appid.length ==0)
				{
					console.error("Usercom Error: Invalid app id !");
					return;
				}
				
				/*  We are creating a global object for usercomlib. 
					We can add properties to this in the services.
					
					You can access the appid,sessioid,visitorid etc in services by using following code
				 	
				 	1. usercomlib.appid - If you are executing the function 
				 	2. thisClass.appid - If you are adding any properties to usercomlib in service.We create thisClass = this;
				*/
				window.usercomlib = {};
				
				usercomlib.appid = appid;
				
				usercomlib.userdata = userComSettings;

				thisClass.bindGlobalErrorHandler(usercomlib);
				
				thisClass.props.appid = appid;
				
				var requestObj = {
						appid : appid,
						userdata : userComSettings,
						uid:utils.guidGenerator(),
                        screenResolution: screen.width+"x"+screen.height,
                        timezone: -(new Date().getTimezoneOffset() / 60)
				}
				
				xhr.raw(DEFAULT_CONFIG.api_baseurl+'/VisitorTrackingManager/ping', JSON.stringify(requestObj),function(data){
					
					var response = JSON.parse(data);
                   
                    thisClass.props.sessionId = response.sessionId;
                   
                    thisClass.props.visitorId = response.status._id;
                    
                    usercomlib.sessionId = response.sessionId;
                    
                    usercomlib.visitorId = response.status._id;

				    thisClass.establishSocketConnection(usercomlib);
                    	
                    thisClass.initServices();
                    
                    usercomlib.trackEvent("Logged In",{});
				});
			},
			
			track : function(eventName,properties)
			{
				if(window.usercomlib.trackEvent){
					 usercomlib.trackEvent(eventName,properties);
				}
				else
				{  
					setTimeout(function(){
						Usercom.track(eventName,properties);
					},500);
				}
    		},
			
			establishSocketConnection : function(usercomlib)
			{
				var protocol = "ws";
                var port = "8001";
                if(location.protocol == "https:")
                {
                    protocol = "wss";
                    port = "8002";
                }

                var ws = new WebSocket(protocol+"://"+DEFAULT_CONFIG.api_host+":"+port+"/");

				ws.onopen = function()
				{
						var msg = {};
						msg.name = "establishvisitorconnection";
						msg.key = usercomlib.userdata.email +'-'+ usercomlib.appid ;
						msg.sessionId = usercomlib.sessionId ;
						msg  = JSON.stringify(msg);
						ws.send(msg);
				}

				ws.onclose  = function()
				{
					ws.send("closing");
				}
			
			},
			
			bindGlobalErrorHandler : function(usercomlib)
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
							appid : usercomlib.appid,
							userdata : usercomlib.userData,
							errormsg : message,
							uid:utils.guidGenerator()
					}
					
					xhr.raw(DEFAULT_CONFIG.api_baseurl+'/VisitorTrackingManager/error', JSON.stringify(requestObj),function(data){
						//Error posted
					});
					
					return false;
				}
			},
	
			initServices : function()
			{
				for(var i=0;i<SERVICES.length;i++)
				{
					try
					{
						window[SERVICES[i]]();
					}
					catch(Exception)
					{
						console.log(SERVICES[i] + " service is not present  !");
					}
					
					
				}
			}
	}
	


