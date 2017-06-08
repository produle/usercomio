/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the Browser Notification related operations
 *
 */

var express = require("express");
var app = require("../server").app;
var moment = require("moment");
var mailer = require('express-mailer');
var utils = require("../core/utils.js").utils;
var webpush = require('web-push');

var browserNotificationSetting = null;

class BrowserNotificationManager {

  constructor()
    {

        this.router = express.Router();

        this.router.post("/getbrowsernotificationtemplates",(req, res) => { this.getAllBrowserNotificationTemplates(req,res); });
        this.router.post("/deletetemplate",(req, res) => { this.deleteTemplate(req,res); });
        this.router.post("/addbrowsernotificationsetting",(req, res) => {
        	   this.addBrowserNotificationSettings(req.body.user,req.body.browserNotificationSettings,function(browserNotificationSetting){
                   if(browserNotificationSetting)
                   {
                	   return res.send({status:'success'});
                   }
                   else
                   {
                       return res.send({status:'failure'});
                   }
               });
        });
        this.router.post("/getbrowsernotificationsetting",(req, res) => {
            this.getBrowserNotificationSettingByCompany(req.body.appId,req.body.company,function(browserNotificationSetting){

            	var config = require('config');
           		if(config.has("setupCompleted") && config.get("setupCompleted") == 1 && !req.isAuthenticated())
                 {
                     return res.send({status:'authenticationfailed'});
                 }
                return res.send({status:"Success",browserNotificationSetting:browserNotificationSetting});
            });
        });
        this.router.post("/savebrowsernotificationsetting",(req, res) => { this.updateBrowserNotificationSetting(req,res); });
    }

    /*
     * @desc Initializes browser notification configuration
     */
    initBrowserNotificationConfig(appId,user,callback)
    {
        this.getBrowserNotificationSettingByCompany(appId,user.company,function(browserNotificationSettingObj){

            browserNotificationSetting = browserNotificationSettingObj;

            if(browserNotificationSetting.fcmKey != null && browserNotificationSetting.fcmKey != "")
            {
                webpush.setGCMAPIKey(browserNotificationSetting.fcmKey);
                callback(true);
            }
            else
            {
                callback(false);
            }

        });
    }

    /*
     * @desc Sends the browser notification via the specified interface
     */
    sendBrowserNotification(visitorObj,subject,message)
    {

        //Get sessions of the user
         var sessionsCollection = global.db.collection('sessions').aggregate([
                    { $match :
                        { "$and": [
                            {
                              visitorId:visitorObj.id
                            }
                          ]
                        }
                    }
                ]).toArray(function(err,sessions)
                {
                    if(err)
                    {
                        console.log("ERROR: "+err);
                        return res.send({status:"failure"});
                    }

                    //Foreach session that has notification data, send noti

                    for(var i = 0; i < sessions.length; i++)
                    {
                        var sessionItem = sessions[i];

                        if(sessionItem.hasOwnProperty("notification") && sessionItem.notification.hasOwnProperty("endpoint") && sessionItem.notification.hasOwnProperty("p256dh") && sessionItem.notification.hasOwnProperty("auth"))
                        {
                            if(sessionItem.notification.endpoint != null && sessionItem.notification.p256dh != null && sessionItem.notification.auth != null)
                            {
                                webpush.sendNotification(
                                    {
                                        endpoint: sessionItem.notification.endpoint,
                                        keys: {
                                            p256dh: sessionItem.notification.p256dh,
                                            auth: sessionItem.notification.auth
                                        }
                                    },
                                    '{"title":"'+subject+'","message":"'+message+'","url":"http://localhost:1234"}',
                                    {
                                        TTL: 10
                                    }
                                )
                                .then(function() {

                                })
                                .catch(function(error) {
                                    console.log(error);
                                });
                            }
                        }
                    }

                }
            );


    }

  	/*
  	 * @desc Collects the list of browser notification templates available for the app
  	 */
  	getAllBrowserNotificationTemplates(req,res)
  	{
        if(!req.isAuthenticated())
        {
            return res.send({status:'authenticationfailed'});
        }

        var appId = req.body.appid;
        var user = req.body.user;

        var browserNotificationTemplateCollection = global.db.collection('browsernotificationtemplates').aggregate([
                { $match :
                    { "$and": [
                        {
                          appId:appId
                        }
                      ]
                    }
                }
            ]).toArray(function(err,templates)
            {
                if(err)
                {
                    console.log("ERROR: "+err);
                    return res.send({status:"failure"});
                }
                return res.send({status:"Success",browserNotificationTemplateList:templates});

            }
        );

    }

    /*
     * @desc Stores the new browser notification template in the DB
     */
    saveNewTemplate(appId,user,subject,message,callback)
    {
        var browserNotificationTemplateCollection = global.db.collection('browsernotificationtemplates');

        var templateObj = {
            _id: utils.guidGenerator(),
            appId: appId,
            clientId: user.company,
            creator: user._id,
            subject: subject,
            message: message,
            createdOn: new Date(),
            isHTML: false,
            recipientList: []
        };

        browserNotificationTemplateCollection.insert(templateObj);

        callback(templateObj);
    }

    /*
     * @desc Returns the template object by given id
     */
    getTemplateById(appId,templateid,callback)
    {
        var browserNotificationTemplateCollection = global.db.collection('browsernotificationtemplates').aggregate([
                { $match :
                    { _id: templateid }
                }
            ]).toArray(function(err,template)
                {
                    if(err)
                    {
                        callback(null);
                    }
                    else
                    {
                        callback(template[0]);
                    }
                }
            );
    }

    /*
     * @desc Updates the browser notification template in the DB
     */
    updateTemplate(appId,user,subject,message,templateObj)
    {
        var browserNotificationTemplateCollection = global.db.collection('browsernotificationtemplates');

        browserNotificationTemplateCollection.update(
            { _id:  templateObj._id},
            { $set :
                {
                    subject: subject,
                    message: message
                }
            },
            { upsert: true }
        )

        return true;
    }

    /*
     * @desc Deletes the browser notification template in the DB
     */
    deleteTemplate(req,res)
    {
        if(!req.isAuthenticated())
        {
            return res.send({status:'authenticationfailed'});
        }

        var appId = req.body.appid;
        var user = req.body.user;
        var templateId = req.body.templateId;

        global.db.collection('browsernotificationtemplates').remove({_id:templateId,appId:appId},function(err,numberOfRemovedDocs)
        {
            if(err)
            {
                return res.send({status:'failure'});
            }
            return res.send({status:'success'});
        });
    }

    /*
     * @desc Stores the new browsernotificationsettings in the DB
     */
    addBrowserNotificationSettings(user,browserNotificationSettings,callback)
    {
        var browserNotificationSettingsCollection = global.db.collection('browsernotificationsettings');
        var userCollection = global.db.collection('users');

        browserNotificationSettings._id = utils.guidGenerator();
        browserNotificationSettings.clientId = user.company;

        userCollection.findOne({ _id: user._id },function(err,userObj)
          {
              if(err)
              {
                  callback(null);
              }
              else
              {
                  browserNotificationSettings.clientId = userObj.company;

                  browserNotificationSettingsCollection.insert(browserNotificationSettings);

                  callback(true);
              }

          });

    }

    /*
     * @desc Returns the browserNotificationsetting object by given clientid
     */
    getBrowserNotificationSettingByCompany(appId,clientId,callback)
    {
        var browserNotificationSettingsCollection = global.db.collection('browsernotificationsettings').aggregate([
                { $match :
                    { "$and": [
                        {
                          clientId:clientId
                        },
                        {
                            appId:appId
                        }
                      ]
                    }
                 }
            ]).toArray(function(err,browserNotificationSetting)
                {
                    if(err)
                    {
                        callback(null);
                    }
                    else
                    {
                        if(browserNotificationSetting.length == 1)
                        {
                            callback(browserNotificationSetting[0]);
                        }
                        else
                        {
                            callback(null);
                        }
                    }
                }
            );
    }

    /*
     * @desc Updates the browser notification settings in the DB
     */
    updateBrowserNotificationSetting(req,res)
    {

        var config = require('config');
   		if(config.has("setupCompleted") && config.get("setupCompleted") == 1 && !req.isAuthenticated())
        {
            return res.send({status:'authenticationfailed'});
        }

        var user = req.body.user;
        var browserNotificationSetting = req.body.browserNotificationSetting;

        var browserNotificationSettingsCollection = global.db.collection('browsernotificationsettings');

        browserNotificationSettingsCollection.update(
            { _id:  browserNotificationSetting._id},
            browserNotificationSetting,
            { upsert: false }
        )

        return res.send({status:'success'});
    }

  	/*
  	 * @desc Validates the visitor and app data, returns the app details
  	 */
  	validateAppDetails(appId, visitorId, callback)
  	{
        if(appId)
    	{

            var visitorsCollection = global.db.collection('visitors').aggregate([
                { $match :
                    {
                        appId: appId,
                        _id: visitorId
                    }
                },
                { $limit : 1 }
            ]).toArray(function(err,visitors)
                {
                    if(err)
                    {
                        callback(false,false);
                    }
                    else if(visitors.length > 0)
                    {
                        global.db.collection('apps').aggregate([
                            { $match :
                                { _id: appId }
                            },
                            { $limit : 1 }
                        ]).toArray(function(err,apps)
                            {
                                if(err)
                                {
                                    callback(false,false);
                                }
                                else if(apps.length > 0)
                                {
                                    callback(apps[0],visitors[0]);
                                }
                                else
                                {
                                    callback(false,false);
                                }
                            }
                        );


                    }
                    else
                    {
                        callback(false,false);
                    }
                }
            );
    	}

  	}

  	/*
  	 * @desc Unsubscribes an user browser notification from an app
  	 */
  	unsubscribeVisitorFromApp(appDetails, visitorDetails)
  	{
        if(appDetails)
    	{
            var BrowserNotificationManagerObj = new BrowserNotificationManager();

            var browserNotificationSettingsCollection = global.db.collection('browsernotificationsettings');

            BrowserNotificationManagerObj.getBrowserNotificationSettingByCompany(appDetails._id,appDetails.clientId, function(browserNotificationSetting){

                if(!browserNotificationSetting.hasOwnProperty("unsubscribeList"))
                {
                    browserNotificationSetting.unsubscribeList = [];
                }
                browserNotificationSetting.unsubscribeList.push(visitorDetails._id);

                browserNotificationSettingsCollection.update(
                    { _id:  browserNotificationSetting._id},
                    browserNotificationSetting,
                    { upsert: false }
                );

            });

            return true;
        }

  	}
}


module.exports.BrowserNotificationManager = BrowserNotificationManager;
