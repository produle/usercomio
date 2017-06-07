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
var aws = require('aws-sdk/global');
var sesObj = require('aws-sdk/clients/ses');
var ses = null;

var emailSetting = null;

class EmailManager {

  constructor()
    {

        this.router = express.Router();


        this.router.post("/sendmessage",(req, res) => { this.sendMessage(req,res); });
        this.router.post("/getemailtemplates",(req, res) => { this.getAllEmailTemplates(req,res); });
        this.router.post("/deletetemplate",(req, res) => { this.deleteTemplate(req,res); }); 
        this.router.post("/addemailsetting",(req, res) => {  
        	   this.addEmailSettings(req.body.user,req.body.emailSettings,function(emailsetting){
                   if(emailsetting) 
                   {
                	   return res.send({status:'success'});
                   }
                   else
                   { 
                       return res.send({status:'failure'});
                   }  
               });
        });
        this.router.post("/getemailsetting",(req, res) => {
            this.getEmailSettingByCompany(req.body.appId,req.body.company,function(emailsetting){
            	
            	var config = require('config'); 
           		if(config.has("setupCompleted") && config.get("setupCompleted") == 1 && !req.isAuthenticated())
                 {
                     return res.send({status:'authenticationfailed'});
                 } 
                return res.send({status:"Success",emailsetting:emailsetting});
            });
        });
        this.router.post("/saveemailsetting",(req, res) => { this.updateEmailSetting(req,res); });
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
        var blockDuplicate = req.body.blockDuplicate;

        var recipientList = [];

        var EmailManagerObj = new EmailManager();

        EmailManagerObj.initMailConfig(appId,user);

        if(template == "new")
        {
            EmailManagerObj.saveNewTemplate(appId,user,subject,message,function(templateObj){
                EmailManagerObj.processMessage(appId,user.company,filterId,exclusionList,inclusionList,subject,message,templateObj,blockDuplicate);
            });
        }
        else
        {
            EmailManagerObj.getTemplateById(appId,template,function(templateObj){
                EmailManagerObj.updateTemplate(appId,user,subject,message,templateObj);
                EmailManagerObj.processMessage(appId,user.company,filterId,exclusionList,inclusionList,subject,message,templateObj,blockDuplicate);
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
    processMessage(appId,clientId,filterId,exclusionList,inclusionList,subject,message,templateObj,blockDuplicate)
    {

        var EmailManagerObj = new EmailManager();

        if(filterId != null)
        {
            var visitorListManagerObj = new visitorListManager();
            visitorListManagerObj.getFilterData(appId,filterId,"visitorMetaInfo.lastSeen",1,0,null,exclusionList,function(response,totalcount){

                    EmailManagerObj.selectRecipients(response,subject,message,templateObj,blockDuplicate,appId,clientId);
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

                    EmailManagerObj.selectRecipients(response,subject,message,templateObj,blockDuplicate,appId,clientId);
                }
            );
        }
    }

    /*
     * @desc Loops throught the recipient list and mails with a spam check
     */
    selectRecipients(response,subject,message,templateObj,blockDuplicate,appId,clientId)
    {
        var EmailManagerObj = new EmailManager();

        EmailManagerObj.getEmailSettingByCompany(appId,clientId,function(emailSettingObj){

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
                else if(emailSettingObj.hasOwnProperty("unsubscribeList") && emailSettingObj.unsubscribeList.includes(response[iter]._id))
                {
                    //Will not send email to unsubscribed emails
                }
                else
                {
                    var recipientSingle = {};
                    recipientSingle.id = response[iter]._id;
                    recipientSingle.visitorData = response[iter].visitorData;

                    EmailManagerObj.parseEmail(message,recipientSingle,function(parsedMessage,recipientSingle){

                        //Set the unsubscribe link in the email
                        parsedMessage = parsedMessage + "\r\n\r\n\r\nClick the link below to unsubscribe emails\r\n"+baseURL+"/unsubscribe/"+appId+"/"+recipientSingle.id;
                        EmailManagerObj.saveEmailMessage(recipientSingle.id,recipientSingle.visitorData.email,subject,parsedMessage,templateObj,appId,clientId);
                        EmailManagerObj.sendMail(recipientSingle.visitorData.email,subject,parsedMessage);
                    });
                }

            }
        });
    }

    /*
     * @desc Parses the local variables in the email body to the user data
     */
    parseEmail(message,recipientSingle,callback)
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
     * @desc Initializes email configuration
     */
    initMailConfig(appId,user)
    {
        this.getEmailSettingByCompany(appId,user.company,function(emailSettingObj){

            emailSetting = emailSettingObj;
            if(emailSetting.emailType && emailSetting.emailType == "SMTP")
            {
                if(typeof app.mailer == "undefined")
                {
                    mailer.extend(app, {
                        from: emailSetting.smtp.user,
                        host: emailSetting.smtp.host,
                        secureConnection: false, // use SSL
                        port: emailSetting.smtp.port, // port for secure SMTP
                        transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
                        auth: {
                            user: emailSetting.smtp.user,
                            pass: emailSetting.smtp.pass
                        }
                    });
                }
            }

            if(emailSetting.emailType && emailSetting.emailType == "Mailgun")
            {
                if(mailgun == null)
                {
                    mailgun = require('mailgun-js')({apiKey: emailSetting.mailgun.key, domain: emailSetting.mailgun.domain});
                }
            }

            if(emailSetting.emailType && emailSetting.emailType == "Amazon")
            {
                if(ses == null)
                {
                    ses = new aws.SES({
                        "accessKeyId": emailSetting.amazon.key,
                        "secretAccessKey": emailSetting.amazon.secret,
                        "region": emailSetting.amazon.region
                    });
                }
            }

        });
    }

    /*
     * @desc Parses the local variables in the email body to the user data
     */
    sendMail(toEmail,subject,message)
    {
        var emailsetting = emailSetting;

        if(emailSetting.emailType && emailSetting.emailType == "SMTP")
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
        
        if(emailSetting.emailType && emailSetting.emailType == "Mailgun")
        {
            var data = {
                from: emailSetting.mailgun.from,
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
        
        if(emailSetting.emailType && emailSetting.emailType == "Amazon")
        {

            ses.sendEmail( {
                Source: emailSetting.amazon.from,
                Destination: {
                    ToAddresses : [toEmail]
                },
                Message: {
                    Subject: {
                        Data: subject
                    },
                    Body: {
                        Text: {
                            Data: message,
                        }
                    }
                }
            },function(err, data) {
                if(err)
                {
                    // handle error
                    console.log("ERROR in sending Email via Amazon SES, check the credentials"); 
                }
            });
        }
        
        
    }

    /*
     * @desc Stores the email sent in the DB
     */
    saveEmailMessage(visitorId,visitorEmail,subject,message,templateObj,appId,clientId)
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
            appId: appId,
            clientId: clientId,
            isHTML: false,
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
            return res.send({status:'authenticationfailed'});
        }

        var appId = req.body.appid;
        var user = req.body.user;

        var emailTemplateCollection = global.db.collection('emailtemplates').aggregate([
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
                return res.send({status:"Success",emailTemplateList:templates});

            }
        );

    }

    /*
     * @desc Stores the new email template in the DB
     */
    saveNewTemplate(appId,user,subject,message,callback)
    {
        var emailTemplatesCollection = global.db.collection('emailtemplates');

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

        emailTemplatesCollection.insert(templateObj);

        callback(templateObj);
    }

    /*
     * @desc Returns the template object by given id
     */
    getTemplateById(appId,templateid,callback)
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

    /*
     * @desc Updates the email template in the DB
     */
    updateTemplate(appId,user,subject,message,templateObj)
    {
        var emailTemplatesCollection = global.db.collection('emailtemplates');

        emailTemplatesCollection.update(
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
     * @desc Deletes the email template in the DB
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

        global.db.collection('emailtemplates').remove({_id:templateId,appId:appId},function(err,numberOfRemovedDocs)
        {
            if(err)
            {
                return res.send({status:'failure'});
            }
            return res.send({status:'success'});
        });
    }

    /*
     * @desc Stores the new emailsettings in the DB
     */ 
    addEmailSettings(user,emailSettings,callback)
    { 
        var emailSettingsCollection = global.db.collection('emailsettings');
        var userCollection = global.db.collection('users');

        emailSettings._id = utils.guidGenerator();
        emailSettings.clientId = user.company; 
          
        userCollection.findOne({ _id: user._id},function(err,userObj)
          {
             
              if(err)
              {
                  callback(null);
              }
              else
              {
                  emailSettings.clientId = userObj.company;

                  emailSettingsCollection.insert(emailSettings);
 
                  callback(true);
              }
              
          });
    	
    }

    /*
     * @desc Returns the emailsetting object by given clientid
     */
    getEmailSettingByCompany(appId,clientId,callback)
    {
        var emailSettingsCollection = global.db.collection('emailsettings').aggregate([  
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
                
            ]).toArray(function(err,emailsetting)
                {
                    if(err)
                    {
                        callback(null);
                    }
                    else
                    {
                        callback(emailsetting[0]);
                    }
                }
            );
    }

    /*
     * @desc Updates the email settings in the DB
     */
    updateEmailSetting(req,res)
    {

    	var config = require('config'); 
   		if(config.has("setupCompleted") && config.get("setupCompleted") == 1 && !req.isAuthenticated())
        {
            return res.send({status:'authenticationfailed'});
        }

        var user = req.body.user;
        var emailSetting = req.body.emailSetting; 
        var emailSettingsCollection = global.db.collection('emailsettings');

        emailSettingsCollection.update(
            { _id:  emailSetting._id},
            emailSetting,
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
  	 * @desc Unsubscribes an user email from an app
  	 */
  	unsubscribeVisitorFromApp(appDetails, visitorDetails)
  	{
        if(appDetails)
    	{
            var EmailManagerObj = new EmailManager();

            var emailSettingsCollection = global.db.collection('emailsettings');

            EmailManagerObj.getEmailSettingByCompany(appDetails._id,appDetails.clientId, function(emailSetting){

                if(!emailSetting.hasOwnProperty("unsubscribeList"))
                {
                    emailSetting.unsubscribeList = [];
                }
                emailSetting.unsubscribeList.push(visitorDetails._id);

                emailSettingsCollection.update(
                    { _id:  emailSetting._id},
                    emailSetting,
                    { upsert: false }
                );

            });

            return true;
        }

  	}
}


module.exports.EmailManager = EmailManager;
