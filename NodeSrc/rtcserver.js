var app = require('express')();
var WebSocket = require('ws');
var http = require('http');
var server = http.createServer(app);
var wss = new WebSocket.Server({ server });

var wsClients = {};
var wsVisitors = {};


wss.on('connection', function connection(ws, req) {
	
	//TODO
	//We can remove the entry of each wsClients when the users logouts from the usercomio dashboard
	//We can remove each entry from wsVisitors when user is not active i.e., visitor has switched the tab or he is not active in the tab
	//We need to clear clients from wsClients where user logs out from usercomio dashboard.We can get all the app id and send it to clear.
	 
	ws.on("message",function(msg){
		
		msg = JSON.parse(msg);
		
		if(msg.name == "establishappconnection")
		{
			wsClients[msg.key] = ws;
			ws["clientkey"] = msg.key;
		}
		
		if(msg.name == "establishvisitorconnection")
		{
			wsVisitors[msg.key] = ws;
			ws["visitorkey"] = msg.key;
			
			var appid = msg.key.split("-")[1];
			var key = msg.key;
		
			var msg = {};
			msg.name = "visitorjoined";
			msg.visitorKey = key;
			
			if(wsClients[appid])
			{	
				wsClients[appid].send(JSON.stringify(msg));
			}
		}
		
		if(msg.name == "userpresence")
		{
			var visitorsToCheck = msg.visitors;
			
			var msg = {};
			msg.name = "userpresencecheck";
			msg.visitorsconnected = []; 
			
			for(var i=0;i<visitorsToCheck.length;i++)
			{
				var visitorWebSocketKey = visitorsToCheck[i];
				
				if(wsVisitors[visitorWebSocketKey])
				{
					var appid = visitorWebSocketKey.split("-")[1];
					
					var msg = {};
					msg.name = "visitorjoined";
					msg.visitorKey = visitorWebSocketKey;
					
					if(wsClients[appid])
					{	
						wsClients[appid].send(JSON.stringify(msg));
					}
				}
			}
			
			
			
		}
		
		
	});
	
	ws.on('close',function close(a,b) {
			
		    if(typeof ws["visitorkey"] != "undefined")
		    {
		    	var visitorkey  = ws["visitorkey"]; 
		    	var appid = visitorkey.split("-")[1];
				var key = visitorkey;
			
				var msg = {};
				msg.name = "visitordisconnected";
				msg.visitorKey = key;
				
                delete wsVisitors[visitorkey];

				if(wsClients[appid])
				{	
					wsClients[appid].send(JSON.stringify(msg));
				}
				///store session close into db here
				
				
		    }
		    else if(typeof ws["clientkey"] != "undefined")
		    {
		    	var clientkey  = ws["clientkey"];

                delete wsClients[clientkey];

		    }
		    else
		    {
				console.log('disconnected');
		    }
	});
});


io = {
		emit : function(data)
		{
			try
			{
				wsClients[data.reciever].send(JSON.stringify(data));
			}
			catch(err)
			{
				console.log(err);
			}
		}
		
}

module.exports.io = io;

server.listen(8001, function listening() {
console.log('Listening on %d', server.address().port);
});

