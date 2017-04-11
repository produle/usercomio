/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the Visitor List related operations
 *
 */

var express = require("express");
var app = require("../server").app;
var moment = require("moment");

class VisitorListManager {

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
        var appid = req.body.appid;
        var skipIndex = req.body.skipindex;
        var pageLimit = req.body.pagelimit;
        var filterId = req.body.filterid;
        var sortColumn = req.body.sortColumn;
        var sortOrder = req.body.sortOrder;

        this.getAllVisitorsFromDB(appid,filterId,sortColumn,sortOrder,skipIndex,pageLimit,[],function(response,totalcount){
            return res.send({status:response,totalcount:totalcount});
        });

  	}

  	/*
  	 * @desc Returns all visitors of the app
  	 */
  	getAllVisitorsFromDB(appid,filterId,sortColumn,sortOrder,skipIndex,pageLimit,exclusionList,callback)
  	{
        var sortQuery = JSON.parse('{"'+sortColumn+'":'+sortOrder+'}');

        var filter = global.db.collection('filters').findOne(

            {_id:filterId},

            function(err,filter)
            {
                var filterQuery = JSON.parse(filter.mongoFilter);

                if(filterId == "2")
                {
                    var date30DaysAgo = new Date(moment( moment().subtract(30, 'days') ).format("YYYY-MM-DDTHH:mm:ss.SSSZ"));
                    filterQuery = {"visitormetainfo.firstseen" : {"$gte":date30DaysAgo }};
                }

                if(filterId == "3")
                {
                    var date30DaysAgo = new Date(moment( moment().subtract(30, 'days') ).format("YYYY-MM-DDTHH:mm:ss.SSSZ"));
                    filterQuery = {"visitormetainfo.lastseen" : {"$lte":date30DaysAgo }};
                }

                var aggregateArray = [
                    { $skip : skipIndex },
                    {
                      $lookup:
                        {
                          from: "sessions",
                          localField: "_id",
                          foreignField: "visitorid",
                          as: "sessions"
                        }
                    },
                    { $sort :
                        sortQuery
                    },
                    { $match :
                        { "$and": [
                            {
                              appid:appid
                            },
                            { _id: {"$nin": exclusionList}},
                            filterQuery
                          ]
                        }
                    }
                ];

                var aggregateWithLimit = aggregateArray;
                var aggregateWithCount = aggregateArray;

                if(pageLimit != null)
                {
                    aggregateWithLimit.push({ $limit : pageLimit });
                }

                var visitorCollection = global.db.collection('visitors').aggregate(aggregateWithLimit).toArray(function(err,visitors)
                    {
                        if(err)
                        {
                            callback('failure');
                        }

                        aggregateWithCount.push({$count: "count"});

                        var visitorRecordCollection = global.db.collection('visitors').aggregate(aggregateWithCount).toArray(function(err,totalcount)
                            {
                                if(err)
                                {
                                    callback('failure');
                                }

                                callback(visitors,totalcount);
                            }
                        );
                    }
                );
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


module.exports.VisitorListManager = VisitorListManager;
