/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the Visitor List related operations
 *
 */

var express = require("express");
var app = require("../server").app;
var moment = require("moment");
var deepcopy = require("deepcopy");

class VisitorListManager {

  constructor()
    {

        this.router = express.Router();


        this.router.post("/visitorlist",(req, res) => { this.getAllVisitors(req,res); });
        this.router.post("/getvisitordetails",(req, res) => { this.getVisitorById(req,res); });
        this.router.post("/getvisitormessages",(req, res) => { this.getVisitorMessages(req,res); });
        this.router.post("/getvisitorsessions",(req, res) => { this.getVisitorSessions(req,res); });
        this.router.post("/getfieldslist",(req, res) => { this.getFieldsList(req,res); });
        this.router.post("/deletevisitors",(req, res) => { this.getDeleteVisitorsData(req,res); });
        this.router.post("/deletefield",(req, res) => { this.deleteField(req,res); });
    }

  	/*
  	 * @desc Returns all visitors of the app
  	 */
  	getAllVisitors(req,res)
  	{
        if(!req.isAuthenticated())
        {
            return res.send({status:'authenticationfailed'});
        }

        var appId = req.body.appid;
        var skipIndex = req.body.skipindex;
        var pageLimit = req.body.pagelimit;
        var filterId = req.body.filterid;
        var sortColumn = req.body.sortColumn;
        var sortOrder = req.body.sortOrder;
        var mongoFilterQuery = JSON.parse(req.body.mongoFilterQuery);

        if(mongoFilterQuery == null)
        {
            this.getFilterData(appId,filterId,sortColumn,sortOrder,skipIndex,pageLimit,[],function(response,totalcount){
                return res.send({status:response,totalcount:totalcount});
            });
        }
        else
        {

            //Temporary fix
            var filterQueryString = JSON.stringify(mongoFilterQuery);
            filterQueryString = filterQueryString.replace(/visitorData/g, 'visitorDetails.visitorData');
            filterQueryString = filterQueryString.replace(/visitorMetaInfo/g, 'visitorDetails.visitorMetaInfo');
            filterQueryString = filterQueryString.replace(/sessions./g, '');
            mongoFilterQuery = JSON.parse(filterQueryString);

            this.getAllVisitorsFromDB(appId,mongoFilterQuery,sortColumn,sortOrder,skipIndex,pageLimit,[],function(response,totalcount){
                return res.send({status:response,totalcount:totalcount});
            });
        }

  	}

  	/*
  	 * @desc Returns all visitors of the app
  	 */
  	getFilterData(appId,filterId,sortColumn,sortOrder,skipIndex,pageLimit,exclusionList,callback)
  	{
        var filter = global.db.collection('filters').findOne(

            {_id:filterId},

            function(err,filter)
            {
                if(err)
                {console.log("Filter Data Error:");
                    console.log(err);
                }

                //Temporary fix
                var filterQueryString = filter.mongoFilter;
                filterQueryString = filterQueryString.replace(/visitorData/g, 'visitorDetails.visitorData');
                filterQueryString = filterQueryString.replace(/visitorMetaInfo/g, 'visitorDetails.visitorMetaInfo');
                filterQueryString = filterQueryString.replace(/sessions./g, '');

                var filterQuery = JSON.parse(filterQueryString);

                if(filterId == "2")
                {
                    var date30DaysAgo = new Date(moment( moment().subtract(30, 'days') ).format("YYYY-MM-DDTHH:mm:ss.SSSZ"));
                    filterQuery = {"visitorDetails.visitorMetaInfo.firstSeen" : {"$gte":date30DaysAgo }};
                }

                if(filterId == "3")
                {
                    var date30DaysAgo = new Date(moment( moment().subtract(30, 'days') ).format("YYYY-MM-DDTHH:mm:ss.SSSZ"));
                    filterQuery = {"visitorDetails.visitorMetaInfo.lastSeen" : {"$lte":date30DaysAgo }};
                }

                var VisitorListManagerObj = new VisitorListManager();
                VisitorListManagerObj.getAllVisitorsFromDB(appId,filterQuery,sortColumn,sortOrder,skipIndex,pageLimit,exclusionList,callback);
            }
        );


  	}

  	/*
  	 * @desc Returns all visitors of the app
  	 */
  	getAllVisitorsFromDB(appId,filterQuery,sortColumn,sortOrder,skipIndex,pageLimit,exclusionList,callback)
  	{
        var sortQuery = JSON.parse('{"'+sortColumn+'":'+sortOrder+'}');

        var aggregateArray = [
            {"$sort": { visitorId: 1, "agentInfo.sessionStart": -1 }},
            {"$group": {
                "_id": "$visitorId",
                "count": {"$sum": 1},
                "agentInfo": { $first: "$agentInfo" },
                "geoLocationInfo": { $first: "$geoLocationInfo" },
                "ipAddress": { $first: "$ipAddress" },
                "appId": { $first: "$appId" },
                "clientId": { $first: "$clientId" },
                "sessionId": { $first: "$_id" },
            }},
            {
              $lookup:
                {
                  from: "visitors",
                  localField: "_id",
                  foreignField: "_id",
                  as: "visitorDetails"
                }
            },
            { $sort :
                sortQuery
            },
            { $match :
                { "$and": [
                    {
                      appId:appId
                    },
                    { _id: {"$nin": exclusionList}},
                    filterQuery
                  ]
                }
            },
            {
                $project:
                {
                    visitorData: { $arrayElemAt: [ "$visitorDetails.visitorData" , 0 ] },
                    visitorMetaInfo: { $arrayElemAt: [ "$visitorDetails.visitorMetaInfo" , 0 ] },
                    appId: { $arrayElemAt: [ "$visitorDetails.appId" , 0 ] },
                    clientId: { $arrayElemAt: [ "$visitorDetails.clientId" , 0 ] },
                    sessions:
                    {
                        _id: "$sessionId",
                        agentInfo: "$agentInfo",
                        geoLocationInfo: "$geoLocationInfo",
                        visitorId: "$_id",
                        ipAddress: "$ipAddress",
                        appId: "$appId",
                        clientId: "$clientId"
                    },
                    sessionCount: "$count"
                }
            }
        ]; 
         
        var aggregateWithLimit = deepcopy(aggregateArray);  
        var aggregateWithCount =  deepcopy(aggregateArray); 

        if(pageLimit != null)
        {
            aggregateWithLimit.push({ $skip : skipIndex });
            aggregateWithLimit.push({ $limit : pageLimit });
        }

        var sessionCollection = global.db.collection('sessions').aggregate(aggregateWithLimit).toArray(function(err,sessions)
            {
                if(err)
                {console.log("Session Collection Error:");console.log(err);
                    callback('failure');
                }
                else
                {
                    aggregateWithCount.push({$count: "count"});

                    var sessionRecordCollection = global.db.collection('sessions').aggregate(aggregateWithCount).toArray(function(err,totalcount)
                        {
                            if(err)
                            {console.log("Visitor Record Collection Error:");console.log(err);
                                callback('failure');
                            }
                            else
                            {
                                callback(sessions,totalcount);
                            }
                        }
                    );
                }
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
            return res.send({status:'authenticationfailed'});
        }

        var visitorId = req.body.visitorId;
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
                      foreignField: "visitorId",
                      as: "sessions"
                    }
                }
            ]).toArray(function(err,visitor)
                {
                    if(err)
                    {
                        return res.send({status:'failure'});
                    }
                    else if(visitor.length == 0)
                    {
                        return res.send({status:'notfound'});
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
            return res.send({status:'authenticationfailed'});
        }

        var visitorId = req.body.visitorId;
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
  	 * @desc Return collection of visitor sessions datas
  	 */
  	getVisitorSessions(req,res)
  	{
        if(!req.isAuthenticated())
        {
            return res.send({status:'authenticationfailed'});
        }

        var visitorId = req.body.visitorId;
        var skipIndex = req.body.skipindex;
        var pageLimit = req.body.pagelimit; 
        
        if(visitorId)
    	{ 
            var messagesCollection = global.db.collection('visitorevents').aggregate([
                 { $match : { visitorId: visitorId } },
                 { $skip : skipIndex },
                 { $lookup:
                 {
                   from: "sessions",
                   localField: "sessionId",
                   foreignField: "_id",
                   as: "sessions"
                 }
                 },
                 { $limit : pageLimit }
            ]).toArray(function(err,sessions)
                {
                    if(err)
                    {
                        return res.send({status:'failure'});
                    }
                    else
                    {
                        return res.send({status:'success',sessions:sessions});
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
            return res.send({status:'authenticationfailed'});
        }

        var appId = req.body.appid;
        if(appId)
    	{

            var appCollection = global.db.collection('apps');
            appCollection.findOne({ "_id": appId },function(err,app)
            {
                if(err)
                {
                    return res.send({status:'failure'});
                }
                else if(app)
                {
                    if(typeof app.customFieldList == "undefined")
                    {
                        app.customFieldList = [];
                    }

                    return res.send({status:'success',fields:app.customFieldList});
                }

            });
    	}

  	}
  	
  	/*
  	 * @desc Gets the selected visitors based on selection
  	 */
  	getDeleteVisitorsData(req,res)
  	{
  		if(!req.isAuthenticated())
        {
            return res.send({status:'authenticationfailed'});
        }
   		 
  		var VisitorListManagerObj = new VisitorListManager();  
        var appId = req.body.appid; 
        var filterId = req.body.filterId;
        var exclusionList = req.body.exclusionList;
        var inclusionList = req.body.inclusionList;
         
        if(filterId != null)
        {    
        	  VisitorListManagerObj.getFilterData(appId,filterId,"visitorMetaInfo.lastSeen",1,0,null,exclusionList,function(response,totalcount){

            	VisitorListManagerObj.deleteVisitors(response,appId,function(response){
                    return res.send({ status:response });
                }); 
            });
        }
        else
        { 
        	 var visitorCollection = global.db.collection('visitors').aggregate([
	                 { $match :
	                     { "$and": [
	                         {
	                           appId:appId
	                         },
	                         { _id: {"$in": inclusionList}}
	                       ]
	                     }
	                 }
	             ]).toArray(function(err,response)
	             {
	                 if(err)
	                 {
	                     console.log("ERROR: "+err);
	                 }
	
	                 VisitorListManagerObj.deleteVisitors(response,appId,function(response){
	                     return res.send({ status:response });
	                 });
	             }
	         );
        	
        } 
  	};
  	
	/*
  	 * @desc Delete the selected visitors in related tables
  	 */
  	
  	deleteVisitors(visitors,appId,callback) 
  	{	
  		for(var i = 0; i < visitors.length; i++)
        {
        	// Delete visitor in visitor table
            global.db.collection('visitors').remove({_id:visitors[i]._id},function(err,numberOfRemovedDocs)
           {
                 if(err)
                {
                      console.log(err);
                }
           });
           
           // Delete visitor in visitor events table
            global.db.collection('visitorevents').remove({visitorId:visitors[i]._id},function(err,numberOfRemovedDocs)
           {
                 if(err)
                {
                      console.log(err);
                }
            });
            
           // Delete visitor in sessions table
            global.db.collection('sessions').remove({visitorId:visitors[i]._id},function(err,numberOfRemovedDocs)
            {
                if(err)
                {
                      console.log(err);
                }
            });
            
            // Delete visitor in messages table
            global.db.collection('messages').remove({visitorId:visitors[i]._id},function(err,numberOfRemovedDocs)
            {
                if(err)
                {
                      console.log(err);
               }
            });
        
            // Remove visitor id from recipiantList array in Emailtemplates table    
            
           global.db.collection('emailtemplates').update(
            		{ appId: appId},
            		{ $pull: { recipientList : { $in: [visitors[i]._id] } } },  
            		{ multi: true }
           		);
           
           // Remove visitor id from recipiantList array in Browsernotificationtemplates table    
           
           global.db.collection('browsernotificationtemplates').update(
            		{ appId: appId},
            		{ $pull: { recipientList : { $in: [visitors[i]._id] } } },  
            		{ multi: true }
           		);
            
           // Remove visitor id from  unsubscribelist array in Emailsettings table    
        	
            global.db.collection('emailsettings').update(
            		{ appId: appId},
            		{ $pull: { unsubscribeList : { $in:  [visitors[i]._id] } } },  
            		{ multi: true }
            		);
        } 

        callback({status:"deleted"});
  		
  	}
  	
  	
  	/*
  	 * @desc Deletes the selected field
  	 */
  	
  	deleteField(req,res)
  	{
  		if(!req.isAuthenticated())
        {
            return res.send({status:'authenticationfailed'});
        }
   		
	  	  var appId = req.body.appid; 
	      var fieldname = req.body.fieldname;  
	      
	  	  // Delete field name from customFieldList array in apps table
	  		
	  	  global.db.collection('apps').update(
	      		{ _id: appId},
	      		{ $pull: { customFieldList : { $in: [fieldname] } } },  
	      		{ multi: true },
	      		function(err,response)
	      		{ 
	      			if(err)
	      			{
	      				return res.send({ status:'failure' });
	      			}
	      			 
	      			else
	      			{   
	      				// Delete field name from customFieldList array in apps table
	      				var fieldName = JSON.parse('{"visitorData.'+fieldname+'": ""}');
	    
	      				global.db.collection('visitors').update(
	      						{ appId: appId},  
	      						{$unset: fieldName}, 
	      						{ multi: true }, 
	      						function(err,response)
	      						{
	      							if(err)
	      							{
	      								return res.send({ status:'failure' });
	      							}
	      							return res.send({ status:'success'});
	      						}); 
	      			} 
	                     
	             }); 
  	} 
  	
}


module.exports.VisitorListManager = VisitorListManager;
