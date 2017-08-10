/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles real time communication in the application
 *
 */

function UC_RTCController()
{

	var thisClass = this;
	
	this.socket = null;
	
	this.ONLINE = false;
	
	this.sessionID = null;
	
	this.connect = function()
	{
        var protocol = "ws";
        var port = "8001";
        if(location.protocol == "https:")
        {
            protocol = "wss";
            port = "8002";
        }
		thisClass.socket =  new WebSocket(protocol+"://"+location.hostname+":"+port+"/echo");
		
		
		// on connection to server, ask for user's name with an anonymous callback
		thisClass.socket.onopen = function(){
			
			thisClass.ONLINE = thisClass.socket.readyState;
			
			var msg = {};
			msg.name = "establishappconnection";
			msg.key = uc_main.appController.currentAppId
			msg  = JSON.stringify(msg);
			thisClass.socket.send(msg);
		
		};
		
		thisClass.socket.onmessage = function (evt) {
			
			var msg = JSON.parse(evt.data);
		
			if(msg && typeof(msg) === "object")
			{
				thisClass.peerRTC(msg);
			}
	  };
	}
	  
	this.peerRTC = function(msg)
	{
		// On new user
		if(msg.name === 'newvisitor')
		{
			if(msg.reciever == uc_main.appController.currentAppId)
			{
				uc_main.visitorListController.newVisitorAction(msg);
			}
		}
		
		if(msg.name === 'visitorjoined')
		{
			var email = msg.visitorKey.split("-")[0]; 
			var appid = msg.visitorKey.split("-")[1]; 
			
			if(appid == uc_main.appController.currentAppId)
			{
				var visitor = $.grep(uc_main.visitorListController.visitors, function(e){ return e.visitorData.email == email });
				
                if(visitor.length == 1)
                {
				    visitor[0].isVisitorOffline = false;
				    visitor[0].isVisitorOnline = true;
                }
			}
			
			
		}
		
		if(msg.name === 'visitordisconnected')
		{
			var email = msg.visitorKey.split("-")[0]; 
			var appid = msg.visitorKey.split("-")[1]; 
			
			if(appid == uc_main.appController.currentAppId)
			{
			
				var visitor = $.grep(uc_main.visitorListController.visitors, function(e){ return e.visitorData.email == email });
				
				if(visitor.length == 1)
                {
				    visitor[0].isVisitorOffline = true;
				    visitor[0].isVisitorOnline = false;
                }
			}
			
		}
	}
	
	this.sendMessageToServer = function(msg)
	{
		try
		{
			if(thisClass.ONLINE)
			{
				thisClass.socket.send(msg);
			}
			
		}
		catch(ex)
		{
			console.log(ex);
		}
		
		
	};
	
	
}
