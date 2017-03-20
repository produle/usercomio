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
        var filterId = req.body.filterid;

        var filter = global.db.collection('filters').findOne(

            {_id:filterId},

            function(err,filter)
            {
                var filterQuery = JSON.parse(filter.mongoFilter);

                var visitorCollection = global.db.collection('visitors').aggregate([
                    { $match :
                        { "$and": [
                            {
                              appid:appid
                            },
                            filterQuery
                          ]
                        }
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
        );


  	}

  	/*
  	 * @desc Returns all visitors of the app
  	 */
  	getDashboardMetrics(req,res)
  	{

        var appid = req.body.appid;

  		global.db.collection('visitors').aggregate([
            { $match :
                { appid : appid }
            },
            { $group:
                { _id: null, count: { $sum: 1 } }
            }
        ]).toArray(function(err,totalUsers)
            {
                if(err)
                {
                    res.status(500);
                    return res.send({status:'failure'});
                }

                var responseTU = 0;
                if(totalUsers.length > 0)
                {
                	responseTU = totalUsers[0].count;
                }

                    global.db.collection('visitors').aggregate([
                        { $project: {
                            visitormetainfo : [{ lastseen : 1 } , { firstseen : 1 }],
                            appid: 1,
                            isUpdated: { $cmp:["$visitormetainfo.lastseen","$visitormetainfo.firstseen"] }
                        }},
                        { $match : {
                            $and : [
                                { isUpdated : 0 },
                                { appid : appid }
                            ]
                            }
                        },
                        { $group:
                            { _id: null, count: { $sum: 1 } }
                        }
                    ]).toArray(function(err1,newUsers)
                    {
                        if(err1)
                        {
                            res.status(500);
                            return res.send({status:'failure'});
                        }

                        var responseNU = 0;
                        if(newUsers.length > 0)
                        {
                        	responseNU = newUsers[0].count;
                        }

                        global.db.collection('visitors').aggregate([
                            { $match : {
                                $and : [
                                    { "visitormetainfo.lastseen" : {$lt: new Date((new Date())-(1000*60*60*24*30))} },
                                    { appid : appid }
                                ]
                                }
                            },
                            { $group:
                                { _id: null, count: { $sum: 1 } }
                            }
                        ]).toArray(function(err2,slippingAway)
                        {
                            if(err2)
                            {
                                res.status(500);
                                return res.send({status:'failure'});
                            }

                            var responseSA = 0;
                            if(slippingAway.length > 0)
                            {
                            	responseSA = slippingAway[0].count;
                            }
                            return res.send({status:"success",metrics:{
                                totalUsers:responseTU,
                                newUsers:responseNU,
                                slippingAway:responseSA
                            }});
                        });

                    });
            }
        );
  	}

  	/*
  	 * @desc Return data of visitor by ID
  	 */
  	getVisitorById(visitorId,callback)
  	{
        if(visitorId)
    	{

            var visitorCollection = global.db.collection('visitors').aggregate([
                { $match :
                    { _id: visitorId }
                },
                {
                  $lookup:
                    {
                      from: "sessions",
                      localField: "_id",
                      foreignField: "visitorid",
                      as: "sessions"
                    }
                }
            ]).toArray(function(err,visitor)
                {
                    if(err)
                    {
                        return callback(null);
                    }
                    else
                    {
                        return callback(visitor);
                    }
                }
            );

    	}

  	}
}


module.exports.DashboardManager = DashboardManager;
