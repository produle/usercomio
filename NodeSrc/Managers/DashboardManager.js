/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the Dashboard related operations
 *
 */

var express = require("express");
var app = require("../server").app;

class DashboardManager {

  constructor()
    {

        this.router = express.Router();


        this.router.post("/visitorlist",(req, res) => { this.getAllVisitors(req,res); });
    }

  	/*
  	 * @desc Returns all visitors of the app
  	 */
  	getAllVisitors(req,res)
  	{
  		var visitorCollection = global.db.collection('visitors');
  		var appid = req.body.appid;

        visitorCollection.find({appid:appid},{_id:0}).toArray(function(err,visitors)
        {
      	  if(err)
      	  {
      		  res.status(500);
      		  return res.send({status:'failure'});
      	  }

      	  if(visitors)
      	  {
            	return res.send({status:visitors});
      	  }

        });
  	}
}


module.exports.DashboardManager = DashboardManager;
