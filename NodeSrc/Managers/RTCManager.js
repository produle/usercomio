
var express = require("express");
var app = require("../server").app;
var server = require('http').createServer(app);
var io = require('../rtcserver').io;

var connectedApps = {};
var connectedVisitors = {};

class RTCManager
{
	constructor()
    {
		this.app = app;
        this.router = express.Router(); 
    }
	
	newVisitor(newVisitorObj)
	{
		var msg = {};
		msg.name = "newvisitor";
		msg.reciever = newVisitorObj.appId;
		msg.payload = JSON.stringify(newVisitorObj);
		io.emit(msg);
	}
}

module.exports.RTCManager = RTCManager;

