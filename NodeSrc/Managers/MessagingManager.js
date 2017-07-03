/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the Email related operations
 *
 */

var express = require("express");
var app = require("../server").app;
var moment = require("moment");
var visitorListManager = require("./VisitorListManager").VisitorListManager;
var EmailManager = require("./EmailManager").EmailManager;
var BrowserNotificationManager = require("./BrowserNotificationManager").BrowserNotificationManager;
var utils = require("../core/utils.js").utils;
var scheduler = require('node-schedule');

class MessagingManager {

  constructor()
    {

        this.router = express.Router();


        this.router.post("/sendmessage",(req, res) => { this.sendMessage(req,res); });
    }

  	/*
  	 * @desc Collects the recipient list and triggers the mailing
  	 */
  	sendMessage(req,res)
  	{
        if(!req.isAuthenticated())
        {
            return res.send({status:'authenticationfailed'});
        }

        var appId = req.body.appid;
        var user = req.body.user;
        var filterId = req.body.filterId;
        var exclusionList = req.body.exclusionList;
        var inclusionList = req.body.inclusionList;
        var subject = req.body.subject;
        var message = req.body.message;
        var template = req.body.template;
        var link = req.body.link;
        var blockDuplicate = req.body.blockDuplicate;
        var messageType = req.body.messageType;
        var sendType = req.body.sendType;
        var scheduleDatetime = req.body.scheduleDatetime;

        var recipientList = [];

        var MessagingManagerObj = new MessagingManager();

        if(messageType == "email")
        {
            var EmailManagerObj = new EmailManager();

            EmailManagerObj.initMailConfig(appId,user.company,null,function(callbackObj){

                if(template == "new")
                {
                    EmailManagerObj.saveNewTemplate(appId,user,subject,message,function(templateObj){
                        MessagingManagerObj.processMessage(appId,user.company,filterId,exclusionList,inclusionList,subject,message,templateObj,link,blockDuplicate,messageType,sendType,scheduleDatetime);
                    });
                }
                else
                {
                    EmailManagerObj.getTemplateById(appId,template,function(templateObj){
                        EmailManagerObj.updateTemplate(appId,user,subject,message,templateObj);
                        MessagingManagerObj.processMessage(appId,user.company,filterId,exclusionList,inclusionList,subject,message,templateObj,link,blockDuplicate,messageType,sendType,scheduleDatetime);
                    });
                }

            });


        }
        else if(messageType == "browsernotification")
        {
            var BrowserNotificationManagerObj = new BrowserNotificationManager();

            BrowserNotificationManagerObj.initBrowserNotificationConfig(appId,user,function(response){
                if(response)
                {

                    if(template == "new")
                    {
                        BrowserNotificationManagerObj.saveNewTemplate(appId,user,subject,message,link,function(templateObj){
                            MessagingManagerObj.processMessage(appId,user.company,filterId,exclusionList,inclusionList,subject,message,templateObj,link,blockDuplicate,messageType,sendType,scheduleDatetime);
                        });
                    }
                    else
                    {
                        BrowserNotificationManagerObj.getTemplateById(appId,template,function(templateObj){
                            BrowserNotificationManagerObj.updateTemplate(appId,user,subject,message,link,templateObj);
                            MessagingManagerObj.processMessage(appId,user.company,filterId,exclusionList,inclusionList,subject,message,templateObj,link,blockDuplicate,messageType,sendType,scheduleDatetime);
                        });
                    }
                }
            });

        }

        return res.send({status:"Success"});

    }

    /*
     * @desc Process the message with templateid
     */
    processMessage(appId,clientId,filterId,exclusionList,inclusionList,subject,message,templateObj,link,blockDuplicate,messageType,sendType,scheduleDatetime)
    {

        var MessagingManagerObj = new MessagingManager();

        if(filterId != null)
        {
            var visitorListManagerObj = new visitorListManager();
            visitorListManagerObj.getFilterData(appId,filterId,"visitorMetaInfo.lastSeen",1,0,null,exclusionList,function(response,totalcount){

                    MessagingManagerObj.getSettings(response,subject,message,templateObj,link,blockDuplicate,appId,clientId,messageType,sendType,scheduleDatetime);
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

                    MessagingManagerObj.getSettings(response,subject,message,templateObj,link,blockDuplicate,appId,clientId,messageType,sendType,scheduleDatetime);
                }
            );
        }
    }

    /*
     * @desc Obtains the email/browser notification settings
     */
    getSettings(response,subject,message,templateObj,link,blockDuplicate,appId,clientId,messageType,sendType,scheduleDatetime)
    {
        var MessagingManagerObj = new MessagingManager();

        if(messageType == "email")
        {
            var EmailManagerObj = new EmailManager();

            EmailManagerObj.getEmailSettingByCompany(appId,clientId,function(emailSettingObj){

                MessagingManagerObj.selectRecipients(response,subject,message,templateObj,link,blockDuplicate,appId,clientId,messageType,emailSettingObj,sendType,scheduleDatetime);
            });
        }
        else if(messageType == "browsernotification")
        {
            var BrowserNotificationManagerObj = new BrowserNotificationManager();

            BrowserNotificationManagerObj.getBrowserNotificationSettingByCompany(appId,clientId,function(browserNotificationSettingObj){

                MessagingManagerObj.selectRecipients(response,subject,message,templateObj,link,blockDuplicate,appId,clientId,messageType,browserNotificationSettingObj,sendType,scheduleDatetime);
            });
        }

    }

    /*
     * @desc Loops throught the recipient list and mails with a spam check
     */
    selectRecipients(response,subject,message,templateObj,link,blockDuplicate,appId,clientId,messageType,settingObj,sendType,scheduleDatetime)
    {
        var MessagingManagerObj = new MessagingManager();

        var config = require('config');
        var baseURL = "";

        if(config.has("baseURL")) {
            baseURL = config.get("baseURL");
        }

        for(var iter = 0; iter < response.length; iter++)
        {
            if(blockDuplicate && templateObj.recipientList.includes(response[iter]._id))
            {
                //Will not send email to prevent spam
            }
            else if(messageType == "email" && settingObj.hasOwnProperty("unsubscribeList") && settingObj.unsubscribeList.includes(response[iter]._id))
            {
                //Will not send email to unsubscribed emails
            }
            else
            {
                var recipientSingle = {};
                recipientSingle.id = response[iter]._id;
                recipientSingle.visitorData = response[iter].visitorData;

                MessagingManagerObj.parseMessage(message,recipientSingle,function(parsedMessage,recipientSingle){

                    if(messageType == "email" && sendType == "now")
                    {
                        //Set the unsubscribe link in the email
                        parsedMessage = parsedMessage + "\r\n\r\n\r\nClick the link below to unsubscribe emails\r\n"+baseURL+"/unsubscribe/"+appId+"/"+recipientSingle.id;

                        var EmailManagerObj = new EmailManager();

                        EmailManagerObj.sendMail(recipientSingle.visitorData.email,subject,parsedMessage);
                    }
                    else if(messageType == "browsernotification")
                    {
                        var BrowserNotificationManagerObj = new BrowserNotificationManager();

                        BrowserNotificationManagerObj.sendBrowserNotification(recipientSingle,subject,parsedMessage,link,settingObj);
                    }
                    MessagingManagerObj.saveMessage(recipientSingle.id,recipientSingle.visitorData.email,subject,parsedMessage,templateObj,link,appId,clientId,messageType,sendType,scheduleDatetime);

                });
            }

        }

        if(response.length > 0 && messageType == "email" && sendType == "later")
        {
            var momentObj = moment(scheduleDatetime);
            var scheduleDateObj = new Date(
                parseInt(momentObj.format("YYYY")),
                parseInt(momentObj.format("MM")) - 1,
                parseInt(momentObj.format("DD")),
                parseInt(momentObj.format("HH")),
                parseInt(momentObj.format("mm")),
                0
            );

            var job = scheduler.scheduleJob(scheduleDateObj, function(){

                MessagingManagerObj.sendScheduledMessage(appId,scheduleDatetime);

                job.cancel();
            });
        }
    }

    /*
     * @desc Parses the local variables in the email body to the user data
     */
    parseMessage(message,recipientSingle,callback)
    {
        var parsedMessage = message;

        var variableArray = [];
        for (var fieldSingle in recipientSingle.visitorData)
        {
            variableArray.push(fieldSingle);
        }

        for(var iter = 0; iter < variableArray.length; iter++)
        {
            var regExpObj = new RegExp('{'+variableArray[iter]+'}', 'g');

            parsedMessage = parsedMessage.replace(regExpObj,recipientSingle.visitorData[variableArray[iter]]);
        }

        callback(parsedMessage,recipientSingle);
    }

    /*
     * @desc Stores the message sent in the DB
     */
    saveMessage(visitorId,visitorEmail,subject,message,templateObj,link,appId,clientId,messageType,sendType,scheduleDatetime)
    {


        var messagesCollection = global.db.collection('messages');

        var isSent = true;
        if(messageType == "email" && sendType == "later")
        {
            isSent = false;
        }

        messagesCollection.insert({
            _id: utils.guidGenerator(),
            visitorId: visitorId,
            visitorEmail: visitorEmail,
            messageType: messageType,
            subject: subject,
            message: message,
            link: link,
            templateId: templateObj._id,
            appId: appId,
            clientId: clientId,
            isHTML: false,
            sentOn: new Date(),
            scheduleDatetime: scheduleDatetime,
            isSent: isSent

        });

        if(messageType == "email")
        {
            var emailTemplatesCollection = global.db.collection('emailtemplates');

            templateObj.recipientList.push(visitorId);

            emailTemplatesCollection.update(
                { _id:  templateObj._id},
                { $set :
                    {
                        recipientList: templateObj.recipientList
                    }
                },
                { upsert: true }
            )
        }
        else if(messageType == "browsernotification")
        {
            var browserNotificationTemplatesCollection = global.db.collection('browsernotificationtemplates');

            templateObj.recipientList.push(visitorId);

            browserNotificationTemplatesCollection.update(
                { _id:  templateObj._id},
                { $set :
                    {
                        recipientList: templateObj.recipientList
                    }
                },
                { upsert: true }
            )
        }
    }

    /*
     * @desc Triggers the sendmail / sendbrowsernotification based on the provided schedule datetime
     */
    sendScheduledMessage(appId,scheduleDatetime)
    {

        var config = require('config');
        var baseURL = "";

        if(config.has("baseURL")) {
            baseURL = config.get("baseURL");
        }

        var messagesCollection = global.db.collection('messages');

        messagesCollection.aggregate([
                { $match :
                    { "$and": [
                        {
                          appId: appId
                        },
                        {
                          scheduleDatetime: scheduleDatetime
                        },
                        {
                          isSent: false
                        }
                      ]
                    }
                }
            ]).toArray(function(err,messages)
            {
                if(err)
                {
                    console.log("ERROR: "+err);
                }

                if(messages.length > 0)
                {
                    for(var i = 0; i < messages.length; i++)
                    {
                        var messageItem = messages[i];
                        if(messageItem.messageType == "email")
                        {
                            var EmailManagerObj = new EmailManager();

                            //Set the unsubscribe link in the email
                            messageItem.message = messageItem.message + "\r\n\r\n\r\nClick the link below to unsubscribe emails\r\n"+baseURL+"/unsubscribe/"+appId+"/"+messageItem.visitorId;

                            EmailManagerObj.initMailConfig(appId,messageItem.clientId,messageItem, function(messageItem){
                                EmailManagerObj.sendMail(messageItem.visitorEmail,messageItem.subject,messageItem.message);
                            });

                        }
                        //elseif type browserNotification sendBrowserNotification

                        messagesCollection.update(
                            { _id: messageItem._id },
                            { $set :
                                {
                                    "isSent": true,
                                    "sentOn": new Date()
                                }
                            },
                            { upsert: true }
                        );
                    }
                }

                return true;
            }
        );


    }
}


module.exports.MessagingManager = MessagingManager;
