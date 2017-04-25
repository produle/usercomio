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
var mailer = require('express-mailer');
var utils = require("../core/utils.js").utils;
var mailgun = null;
var ses = require('node-ses');
var client = null;

class EmailManager {

  constructor()
    {

        this.router = express.Router();


        this.router.post("/sendmessage",(req, res) => { this.sendMessage(req,res); });
        this.router.post("/getemailtemplates",(req, res) => { this.getAllEmailTemplates(req,res); });
    }

  	/*
  	 * @desc Collects the recipient list and triggers the mailing
  	 */
  	sendMessage(req,res)
  	{
        if(!req.isAuthenticated())
        {
            return res.send({status:'failure'});
        }

        var appid = req.body.appid;
        var user = req.body.user;
        var filterId = req.body.filterId;
        var exclusionList = req.body.exclusionList;
        var inclusionList = req.body.inclusionList;
        var subject = req.body.subject;
        var message = req.body.message;
        var template = req.body.template;
        var blockDuplicate = req.body.blockDuplicate;

        var recipientList = [];

        var EmailManagerObj = new EmailManager();

        EmailManagerObj.initMailConfig();

        if(template == "new")
        {
            EmailManagerObj.saveNewTemplate(appid,user,subject,message,function(templateObj){
                EmailManagerObj.processMessage(appid,filterId,exclusionList,inclusionList,subject,message,templateObj,blockDuplicate);
            });
        }
        else
        {
            EmailManagerObj.getTemplateById(appid,template,function(templateObj){
                EmailManagerObj.processMessage(appid,filterId,exclusionList,inclusionList,subject,message,templateObj,blockDuplicate);
            });
        }

        return res.send({status:"Success"});

    }

    /*
     * @desc Checks whether spam protection is enabled and collects the list of visitors mailed already
     */

    /*
     * @desc Process the message with templateid
     */
    processMessage(appid,filterId,exclusionList,inclusionList,subject,message,templateObj,blockDuplicate)
    {

        var EmailManagerObj = new EmailManager();

        if(filterId != null)
        {
            var visitorListManagerObj = new visitorListManager();
            visitorListManagerObj.getAllVisitorsFromDB(appid,filterId,"visitormetainfo.lastseen",1,0,null,exclusionList,function(response,totalcount){

                    EmailManagerObj.selectRecipients(response,subject,message,templateObj,blockDuplicate);
            });
        }
        else
        {
            var visitorCollection = global.db.collection('visitors').aggregate([
                    { $match :
                        { "$and": [
                            {
                              appid:appid
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

                    EmailManagerObj.selectRecipients(response,subject,message,templateObj,blockDuplicate);
                }
            );
        }
    }

    /*
     * @desc Loops throught the recipient list and mails with a spam check
     */
    selectRecipients(response,subject,message,templateObj,blockDuplicate)
    {
        var EmailManagerObj = new EmailManager();

        for(var iter = 0; iter < response.length; iter++)
        {
            if(blockDuplicate && templateObj.recipientList.includes(response[iter]._id))
            {
                //Will not send email to prevent spam
            }
            else
            {
                var recipientSingle = {};
                recipientSingle.id = response[iter]._id;
                recipientSingle.visitordata = response[iter].visitordata;

                EmailManagerObj.parseEmail(message,recipientSingle,function(parsedMessage,recipientSingle){
                    EmailManagerObj.saveEmailMessage(recipientSingle.id,recipientSingle.visitordata.email,subject,parsedMessage,templateObj);
                    EmailManagerObj.sendMail(recipientSingle.visitordata.email,subject,parsedMessage);
                });
            }

        }
    }

    /*
     * @desc Parses the local variables in the email body to the user data
     */
    parseEmail(message,recipientSingle,callback)
    {
        var parsedMessage = message;

        var variableArray = [];
        for (var fieldSingle in recipientSingle.visitordata)
        {
            variableArray.push(fieldSingle);
        }

        for(var iter = 0; iter < variableArray.length; iter++)
        {
            var regExpObj = new RegExp('{'+variableArray[iter]+'}', 'g');

            parsedMessage = parsedMessage.replace(regExpObj,recipientSingle.visitordata[variableArray[iter]]);
        }

        callback(parsedMessage,recipientSingle);
    }

    /*
     * @desc Initializes email configuration
     */
    initMailConfig()
    {
        var config = require('config');

        if(config.has("emailType") && config.get("emailType") == "SMTP")
        {
            if(typeof app.mailer == "undefined")
            {
                mailer.extend(app, {
                    from: config.smtp.user,
                    host: config.smtp.host,
                    secureConnection: false, // use SSL
                    port: config.smtp.port, // port for secure SMTP
                    transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
                    auth: {
                        user: config.smtp.user,
                        pass: config.smtp.pass
                    }
                });
            }
        }
        
        if(config.has("emailType") && config.get("emailType") == "Mailgun")
        {
            if(mailgun == null)
            {
                mailgun = require('mailgun-js')({apiKey: config.mailgun.key, domain: config.mailgun.domain});
            }
        }
        
        if(config.has("emailType") && config.get("emailType") == "Amazon")
        {
            if(client == null)
            {
                client = ses.createClient({ key: config.amazon.key, secret: config.mailgun.domain });
            }
        }
    }

    /*
     * @desc Parses the local variables in the email body to the user data
     */
    sendMail(toEmail,subject,message)
    {
        var config = require('config');

        if(config.has("emailType") && config.get("emailType") == "SMTP")
        {
            app.mailer.send('email/plain', {
                to: toEmail,
                subject: subject,
                messageBody: message
            }, function (err) {
                if (err) {
                    // handle error
                    console.log("ERROR in sending Email via SMTP, check the credentials");
                }
                return;
            });
        }
        
        if(config.has("emailType") && config.get("emailType") == "Mailgun")
        {
            var data = {
                from: 'Usercom <test@usercom.io>',
                to: toEmail,
                subject: subject,
                text: message
            };

            mailgun.messages().send(data, function (err, body) {
                if (err) {
                    // handle error
                    console.log("ERROR in sending Email via Mailgun, check the credentials");
                }
                console.log(body);
            });
        }
        
        if(config.has("emailType") && config.get("emailType") == "Amazon")
        {
            client.sendEmail({
                to: toEmail,
                from: 'Usercom <test@usercom.io>',
                subject: subject,
                message: message,
                altText: message
            }, function (err, data, res) {
                if (err) {
                    // handle error
                    console.log("ERROR in sending Email via Amazon SES, check the credentials");
                }
                console.log(data);
            });
        }
        
        
    }

    /*
     * @desc Stores the email sent in the DB
     */
    saveEmailMessage(visitorId,visitorEmail,subject,message,templateObj)
    {


        var messagesCollection = global.db.collection('messages');
        var emailTemplatesCollection = global.db.collection('emailtemplates');

        messagesCollection.insert({
            _id: utils.guidGenerator(),
            visitorId: visitorId,
            visitorEmail: visitorEmail,
            subject: subject,
            message: message,
            templateId: templateObj._id,
            sentOn: new Date()
        });

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

  	/*
  	 * @desc Collects the list of email templates available for the app
  	 */
  	getAllEmailTemplates(req,res)
  	{
        if(!req.isAuthenticated())
        {
            return res.send({status:'failure'});
        }

        var appid = req.body.appid;
        var user = req.body.user;

        var emailTemplateCollection = global.db.collection('emailtemplates').aggregate([
                { $match :
                    { "$and": [
                        {
                          appid:appid
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
                return res.send({status:"Success",emailTemplateList:templates});

            }
        );

    }

    /*
     * @desc Stores the new email template in the DB
     */
    saveNewTemplate(appid,user,subject,message,callback)
    {
        var emailTemplatesCollection = global.db.collection('emailtemplates');

        var templateObj = {
            _id: utils.guidGenerator(),
            appid: appid,
            creator: user._id,
            subject: subject,
            message: message,
            createdOn: new Date(),
            recipientList: []
        };

        emailTemplatesCollection.insert(templateObj);

        callback(templateObj);
    }

    /*
     * @desc Returns the template object by given id
     */
    getTemplateById(appid,templateid,callback)
    {
        var emailTemplatesCollection = global.db.collection('emailtemplates').aggregate([
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
}


module.exports.EmailManager = EmailManager;
