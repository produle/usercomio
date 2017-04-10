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

class EmailManager {

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
        var appid = req.body.appid;
        var user = req.body.user;
        var filterId = req.body.filterId;
        var exclusionList = req.body.exclusionList;
        var inclusionList = req.body.inclusionList;
        var subject = req.body.subject;
        var message = req.body.message;

        var recipientList = [];

        var EmailManagerObj = new EmailManager();

        EmailManagerObj.initSMTPConfig();

        if(filterId != null)
        {
            var visitorListManagerObj = new visitorListManager();
            visitorListManagerObj.getAllVisitorsFromDB(appid,filterId,"visitormetainfo.lastseen",1,0,null,exclusionList,function(response){

                for(var iter = 0; iter < response.length; iter++)
                {
                    var recipientSingle = {};
                    recipientSingle.id = response[iter]._id;
                    recipientSingle.visitordata = response[iter].visitordata;

                    EmailManagerObj.parseEmail(message,recipientSingle,function(parsedMessage,recipientSingle){
                        EmailManagerObj.sendSMTPMail(recipientSingle.visitordata.email,subject,parsedMessage);
                    });

                }
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

                    for(var iter = 0; iter < response.length; iter++)
                    {
                        var recipientSingle = {};
                        recipientSingle.id = response[iter]._id;
                        recipientSingle.visitordata = response[iter].visitordata;

                        EmailManagerObj.parseEmail(message,recipientSingle,function(parsedMessage,recipientSingle){
                            EmailManagerObj.sendSMTPMail(recipientSingle.visitordata.email,subject,parsedMessage);
                        });

                    }
                }
            );
        }

        return res.send({status:"Success"});





    }

    /*
     * @desc Parses the local variables in the email body to the user data
     */
    parseEmail(message,recipientSingle,callback)
    {
        var parsedMessage = message;

        var variableArray = ["name","email"];

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
    initSMTPConfig()
    {
        var config = require('config');

        if(config.has("smtp"))
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
    }

    /*
     * @desc Parses the local variables in the email body to the user data
     */
    sendSMTPMail(toEmail,subject,message)
    {
        app.mailer.send('email/plain', {
            to: toEmail, // REQUIRED. This can be a comma delimited string just like a normal email to field.
            subject: subject, // REQUIRED.
            messageBody: message
        }, function (err) {
            if (err) {
                // handle error
                console.log("ERROR in sending Email via SMTP, check the credentials");
            }
            return;
        });
    }
}


module.exports.EmailManager = EmailManager;
