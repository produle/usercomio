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
        this.router.post("/metrics",(req, res) => { this.getDashboardMetrics(req,res); });
    }

  	/*
  	 * @desc Returns all visitors of the app
  	 */
  	getAllVisitors(req,res)
  	{
        var appid = req.body.appid;
        var skipIndex = req.body.skipindex;
        var pageLimit = req.body.pagelimit;

  		var visitorCollection = global.db.collection('visitors').aggregate([
            { $match :
                { appid : appid }
            },
            { $sort :
                { "visitormetainfo.lastseen" : -1 }
            },
            { $skip : skipIndex },
            { $limit : pageLimit },
            {
              $lookup:
                {
                  from: "sessions",
                  localField: "_id",
                  foreignField: "visitorid",
                  as: "sessions"
                }
            }
        ]).toArray(function(err,visitors)
            {
                if(err)
                {
                    res.status(500);
                    return res.send({status:'failure'});
                }

                return res.send({status:visitors});
            }
        );
  	}

  	/*
  	 * @desc Returns all visitors of the app
  	 */
  	getDashboardMetrics(req,res)
  	{

        var appid = req.body.appid;

  		var visitorCollection = global.db.collection('visitors').aggregate([
            { $group:
                { _id: null, count: { $sum: 1 } }
            }
        ]).toArray(function(err,visitors)
            {
                if(err)
                {
                    res.status(500);
                    return res.send({status:'failure'});
                }

                return res.send({status:visitors});
            }
        );
  	}
}


module.exports.DashboardManager = DashboardManager;
