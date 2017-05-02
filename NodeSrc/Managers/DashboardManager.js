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

        this.router.post("/metrics",(req, res) => { this.getDashboardMetrics(req,res); });
        this.router.post("/newusers",(req, res) => { this.getNewUsersMetrics(req,res); });
    }

  	/*
  	 * @desc Returns all visitors of the app
  	 */
  	getDashboardMetrics(req,res)
  	{

        if(!req.isAuthenticated())
        {
            return res.send({status:'failure'});
        }

        var appId = req.body.appid;

  		global.db.collection('visitors').aggregate([
            { $match :
                { appId : appId }
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
                            visitorMetaInfo : [{ lastSeen : 1 } , { firstSeen : 1 }],
                            appId: 1,
                            isUpdated: { $cmp:["$visitorMetaInfo.lastSeen","$visitorMetaInfo.firstSeen"] }
                        }},
                        { $match : {
                            $and : [
                                { isUpdated : 0 },
                                { appId : appId }
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
                                    { "visitorMetaInfo.lastSeen" : {$lt: new Date((new Date())-(1000*60*60*24*30))} },
                                    { appId : appId }
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
  	 * @desc Returns the data for new user graph
  	 */
  	getNewUsersMetrics(req,res)
  	{

        if(!req.isAuthenticated())
        {
            return res.send({status:'failure'});
        }

        var appId = req.body.appid;
        var days = req.body.days;

        global.db.collection('visitors').aggregate([
            { $match : {
                $and : [
                    { "visitorMetaInfo.firstSeen" : {$gt: new Date((new Date())-(1000*60*60*24*days))} },
                    { appId : appId }
                ]
                }
            },
            { $group: {
                _id: {
                    $add: [
                        { $dayOfYear: "$visitorMetaInfo.firstSeen"},
                        { $multiply:
                            [400, {$year: "$visitorMetaInfo.firstSeen"}]
                        }
                    ]
                },
                visitors: { $sum: 1 },
                first: {$min: "$visitorMetaInfo.firstSeen"}
            }},
            { $sort: {_id: -1} },
            { $limit: 15 },
            { $project: { date: { $dateToString: { format: "%d-%m", date: "$first" } }, visitors: 1, _id: 0} }
        ]).toArray(function(err,newUsers)
        {
            if(err)
            {
                res.status(500);
                return res.send({status:'failure'});
            }

            return res.send({status:newUsers});
        });
  	}
}


module.exports.DashboardManager = DashboardManager;
