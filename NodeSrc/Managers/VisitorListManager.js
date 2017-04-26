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
        this.router.post("/getvisitordetails",(req, res) => { this.getVisitorById(req,res); });
        this.router.post("/getvisitormessages",(req, res) => { this.getVisitorMessages(req,res); });
        this.router.post("/getfieldslist",(req, res) => { this.getFieldsList(req,res); });
    }

  	/*
  	 * @desc Returns all visitors of the app
  	 */
  	getAllVisitors(req,res)
  	{
        if(!req.isAuthenticated())
        {
            return res.send({status:'failure'});
        }

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
  	getVisitorById(req,res)
  	{

        if(!req.isAuthenticated())
        {
            return res.send({status:'failure'});
        }

        var visitorId = req.body.visitorid;
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
                        return res.send({status:'failure'});
                    }
                    else
                    {
                        return res.send({status:'success',visitor:visitor[0]});
                    }
                }
            );

    	}

  	}

  	/*
  	 * @desc Return collection of messages sento a visitor
  	 */
  	getVisitorMessages(req,res)
  	{
        if(!req.isAuthenticated())
        {
            return res.send({status:'failure'});
        }

        var visitorId = req.body.visitorid;
        if(visitorId)
    	{

            var messagesCollection = global.db.collection('messages').aggregate([
                { $match :
                    { visitorId: visitorId }
                }
            ]).toArray(function(err,messages)
                {
                    if(err)
                    {
                        return res.send({status:'failure'});
                    }
                    else
                    {
                        return res.send({status:'success',messages:messages});
                    }
                }
            );

    	}

  	}

  	/*
  	 * @desc Return list of fields available for the app
  	 */
  	getFieldsList(req,res)
  	{
        if(!req.isAuthenticated())
        {
            return res.send({status:'failure'});
        }

        var appid = req.body.appid;
        if(appid)
    	{

            var visitorsCollection = global.db.collection('visitors').aggregate([
                { $match :
                    { appid: appid }
                },
                { $limit : 1 }
            ]).toArray(function(err,visitors)
                {
                    if(err)
                    {
                        return res.send({status:'failure'});
                    }
                    else if(visitors.length > 0)
                    {
                        var fieldList = [];
                        for (var fieldSingle in visitors[0].visitordata)
                        {
                            fieldList.push(fieldSingle);
                        }
                        return res.send({status:'success',fields:fieldList});
                    }
                }
            );
    	}

  	}
}


module.exports.VisitorListManager = VisitorListManager;
