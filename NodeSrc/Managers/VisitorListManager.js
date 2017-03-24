/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the Visitor List related operations
 *
 */

var express = require("express");
var app = require("../server").app;

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

        var sortQuery = JSON.parse('{"'+sortColumn+'":'+sortOrder+'}');

        var filter = global.db.collection('filters').findOne(

            {_id:filterId},

            function(err,filter)
            {
                var filterQuery = JSON.parse(filter.mongoFilter);

                var visitorCollection = global.db.collection('visitors').aggregate([
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
                    },
                    { $sort :
                        sortQuery
                    },
                    { $match :
                        { "$and": [
                            {
                              appid:appid
                            },
                            filterQuery
                          ]
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
