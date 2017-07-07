/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the user related curd operations
 *
 */

function UC_UserController()
{
	var thisClass = this;

    this.config = {};

    this.emailSetting = {};

    this.browserNotificationSetting = {};

    this.rivetAppNameEmailObj = null;
    this.rivetAppNameBrowserNotificationObj = null;

	this.constructor = function()
	{
        $(document).on("click",".ucEditProfile",thisClass.editProfileHandler);
        $(document).on("click",".ucChangePassword",thisClass.editPasswordHandler);
        $(document).on("click",".ucEditMail",thisClass.editMailHandler);
        $(document).on("click",".ucEditBrowserNotification",thisClass.editBrowserNotificationHandler);
        $(document).on("click",".ucEditDatabase",thisClass.editDatabaseHandler);
        $(document).on("click",".ucEditSystem",thisClass.editSystemHandler);

		$(document).on("click","#uceditprofile_submit",thisClass.handleProfileSaveAction);
		$(document).on("click","#ucchangepassword_submit",thisClass.handlePasswordSaveAction);
		$(document).on("click","#uceditmail_submit",thisClass.handleMailSaveAction);
		$(document).on("click","#uceditbrowsernotification_submit",thisClass.handleBrowserNotificationSaveAction);
		$(document).on("click","#uceditdatabase_submit",thisClass.handleDatabaseSaveAction);
		$(document).on("click","#uceditsystem_submit",thisClass.handleSystemSaveAction);

		$(document).on("click","#ucEditEmailTypeTabGroup button",thisClass.handleTypeSelectionAction);

        thisClass.getConfig();

        thisClass.rivetAppNameEmailObj = rivets.bind(
            document.querySelector('#ucEmailSettings_App'), {
                appName: ""
            }
        );

        thisClass.rivetAppNameBrowserNotificationObj = rivets.bind(
            document.querySelector('#ucBrowserNotificationSettings_App'), {
                appName: ""
            }
        );
	};

    /*
     *  @desc Populates the form fields with the user object data
     */
    this.editProfileHandler = function(e)
    {
        var user = UC_UserSession.user;
        $('#uceditprofile_firstname').val(user.firstName);
        $('#uceditprofile_lastname').val(user.lastName);

        $("#ucEditProfileModal").modal();

        $("#uceditprofile_submit").button('reset');

        e.preventDefault();
    };

    /*
     *  @desc Handles the user data validation and sends it to server
     */
    this.handleProfileSaveAction = function(e)
    {
        e.preventDefault();

        var firstname = $('#uceditprofile_firstname').val(),
            lastname = $('#uceditprofile_lastname').val();


        var validationResult = thisClass.validateProfileInputs();

        if(validationResult.status == "failure")
        {
            alert(validationResult.msg);
            return;
        }

        var user = UC_UserSession.user;

        user.firstName = firstname;
        user.lastName = lastname;

        UC_UserSession.user = user;

        $("#uceditprofile_submit").button('loading');
        UC_AJAX.call('UserManager/saveUserProfile',{user:user},function(data,status,xhr)
        {
            if(data)
            {
                if(data.status == "failure")
                {
                    alert("An Error accured while saving data !");
                }
                else if(data.status == "authenticationfailed")
                {
                    location.href="/";
                }
                else
                {
                    alert("Profile saved successfully");
                    uc_main.rivetUserNameObj.models.currentUserName = user.firstName+" "+user.lastName;

                    $("#ucEditProfileModal").modal("hide");
                }
            }

            $("#uceditprofile_submit").button('reset');

        });

        //thisClass.sendLoginRequest(newUser,false);
    };

    /*
     * @desc Validate user data
     */
    this.validateProfileInputs  = function()
    {
        var result = {status:"success",msg:""};

        var firstname = $('#uceditprofile_firstname').val(),
            lastname = $('#uceditprofile_lastname').val(),
            msg = "";

        if($.trim(firstname) == "")
        {
            msg = "Invalid First Name";
        }
        else if($.trim(lastname) == "")
        {
            msg = "Invalid Last Name";
        }

        if(msg != "")
        {
            result.status = "failure";
            result.msg = msg;
        }

        return result;
    };

    /*
     *  @desc Populates the form fields with the user object data
     */
    this.editPasswordHandler = function(e)
    {
        $("#ucEditPasswordModal").modal();

        $("#ucchangepassword_submit").button('reset');

        e.preventDefault();
    };

    /*
     *  @desc Handles the user data validation and sends it to server
     */
    this.handlePasswordSaveAction = function(e)
    {
        e.preventDefault();

        var password = $('#ucchangepassword_password').val(),
            confirmpassword = $('#ucchangepassword_confirmpassword').val();


        var validationResult = thisClass.validatePasswordInputs();

        if(validationResult.status == "failure")
        {
            alert(validationResult.msg);
            return;
        }

        var user = UC_UserSession.user;

        user.password = password;

        UC_UserSession.user = user;

        $("#ucchangepassword_submit").button('loading');

        UC_AJAX.call('UserManager/saveUserPassword',{user:user},function(data,status,xhr)
        {
            if(data)
            {
                delete UC_UserSession.user.password; //To avoid the encrypted password transmitted to client

                if(data.status == "failure")
                {
                    alert("An Error accured while saving data !");
                }
                else if(data.status == "authenticationfailed")
                {
                    location.href="/";
                }
                else
                {
                    alert("Password changed successfully");

                    $("#ucEditPasswordModal").modal("hide");
                }

                $("#ucchangepassword_submit").button('reset');
            }

        });
    };

    /*
     * @desc Validate user data
     */
    this.validatePasswordInputs  = function()
    {
        var result = {status:"success",msg:""};

        var password = $('#ucchangepassword_password').val(),
            confirmpassword = $('#ucchangepassword_confirmpassword').val(),
            msg = "";

        if($.trim(password) == "")
        {
            msg = "Invalid Password !";
        }
        else if($.trim(password) != $.trim(confirmpassword))
        {
            msg = "Confirm Password should match the New Password field";
        }

        if(msg != "")
        {
            result.status = "failure";
            result.msg = msg;
        }

        return result;
    };

    /*
     *  @desc Populates the form fields with the SMTP data
     */
    this.editMailHandler = function(e)
    {
        var user = UC_UserSession.user;

        //Reset Form
        $('#uceditsmtp_host,#uceditsmtp_port,#uceditsmtp_user,#uceditsmtp_pass,#uceditmailgun_key,#uceditmailgun_domain,#uceditmailgun_from,#uceditamazon_key,#uceditamazon_secret,#uceditamazon_region,#uceditamazon_from').val("");

        UC_AJAX.call('EmailManager/getemailsetting',{appId:uc_main.appController.currentAppId,company:user.company},function(data,status,xhr)
        {
            if(data)
            {
                if(data.status == "failure")
                {
                    alert("An Error accured while retrieving email settings!");
                }
                else if(data.status == "authenticationfailed")
                {
                    location.href="/";
                }
                else
                {
                    thisClass.emailSetting = data.emailsetting;

                    var currentAppId = uc_main.appController.currentAppId
                    var appIndex = UC_Utils.searchObjArray(uc_main.appController.apps,'_id',currentAppId);
                    thisClass.rivetAppNameEmailObj.models.appName = uc_main.appController.apps[appIndex].name;

                    if(thisClass.emailSetting.emailType)
                    {
                        thisClass.currentEmailType = thisClass.emailSetting.emailType;
                    }
                    else
                    {
                        thisClass.currentEmailType = "SMTP";
                    }

                    $(".ucEditEmailContainer").hide();
                    $("#ucEditEmail"+thisClass.currentEmailType+"Container").show();

                    $("#ucEditEmailTypeTabGroup button").removeClass("active");
                    $("#ucEditEmailTypeTabGroup button[data-tabgroup-tabid=ucEditEmail"+thisClass.currentEmailType+"Container]").addClass("active");

                    if(thisClass.emailSetting.smtp)
                    {
                        $('#uceditsmtp_host').val(thisClass.emailSetting.smtp.host);
                        $('#uceditsmtp_port').val(thisClass.emailSetting.smtp.port);
                        $('#uceditsmtp_user').val(thisClass.emailSetting.smtp.user);
                        $('#uceditsmtp_pass').val(thisClass.emailSetting.smtp.pass);
                    }
                    if(thisClass.emailSetting.mailgun)
                    {
                        $('#uceditmailgun_key').val(thisClass.emailSetting.mailgun.key);
                        $('#uceditmailgun_domain').val(thisClass.emailSetting.mailgun.domain);
                        $('#uceditmailgun_from').val(thisClass.emailSetting.mailgun.from);
                    }
                    if(thisClass.emailSetting.amazon)
                    {
                        $('#uceditamazon_key').val(thisClass.emailSetting.amazon.key);
                        $('#uceditamazon_secret').val(thisClass.emailSetting.amazon.secret);
                        $('#uceditamazon_region').val(thisClass.emailSetting.amazon.region);
                        $('#uceditamazon_from').val(thisClass.emailSetting.amazon.from);
                    }

                    $("#ucEditMailModal").modal();

                    $("#uceditmail_submit").button('reset');
                }
            }

        });



        e.preventDefault();
    };

    /*
     *  @desc Populates the form fields with the browser notification setting data
     */
    this.editBrowserNotificationHandler = function(e)
    {
        var user = UC_UserSession.user;

        //Reset form
        $('#uceditbrowsernotification_fcmkey,#uceditbrowsernotification_fcmsenderid,#uceditbrowsernotification_fcmappname,#uceditbrowsernotification_icon').val("");

        UC_AJAX.call('BrowserNotificationManager/getbrowsernotificationsetting',{appId:uc_main.appController.currentAppId,company:user.company},function(data,status,xhr)
        {
            if(data)
            {
                if(data.status == "failure")
                {
                    alert("An Error accured while retrieving browser notification settings!");
                }
                else if(data.status == "authenticationfailed")
                {
                    location.href="/";
                }
                else
                {
                    thisClass.browserNotificationSetting = data.browserNotificationSetting;

                    var currentAppId = uc_main.appController.currentAppId
                    var appIndex = UC_Utils.searchObjArray(uc_main.appController.apps,'_id',currentAppId);
                    thisClass.rivetAppNameBrowserNotificationObj.models.appName = uc_main.appController.apps[appIndex].name;

                    $('#uceditbrowsernotification_fcmkey').val(thisClass.browserNotificationSetting.fcmKey);
                    $('#uceditbrowsernotification_fcmsenderid').val(thisClass.browserNotificationSetting.fcmSenderId);
                    $('#uceditbrowsernotification_fcmappname').val(thisClass.browserNotificationSetting.fcmAppName);
                    $('#uceditbrowsernotification_icon').val(thisClass.browserNotificationSetting.icon);
                    $("#ucEditBrowserNotificationModal").modal();

                    $("#uceditbrowsernotification_submit").button('reset');
                }
            }

        });



        e.preventDefault();
    };

    /*
     *  @desc Handles the email data validation and sends it to server
     */
    this.handleMailSaveAction = function(e)
    {
        e.preventDefault();

        if(thisClass.currentEmailType == "SMTP")
        {
            var smtphost = $('#uceditsmtp_host').val(),
                smtpport = $('#uceditsmtp_port').val(),
                smtpuser = $('#uceditsmtp_user').val(),
                smtppass = $('#uceditsmtp_pass').val();


            var validationResult = thisClass.validateSMTPInputs();

            if(validationResult.status == "failure")
            {
                alert(validationResult.msg);
                return;
            }

            thisClass.emailSetting.emailType = "SMTP";
            thisClass.emailSetting.smtp.host = smtphost;
            thisClass.emailSetting.smtp.port = smtpport;
            thisClass.emailSetting.smtp.user = smtpuser;
            thisClass.emailSetting.smtp.pass = smtppass;
        }
        else if(thisClass.currentEmailType == "Mailgun")
        {
            var mailgunkey = $('#uceditmailgun_key').val(),
                mailgundomain = $('#uceditmailgun_domain').val(),
                mailgunfrom = $('#uceditmailgun_from').val();


            var validationResult = thisClass.validateMailgunInputs();

            if(validationResult.status == "failure")
            {
                alert(validationResult.msg);
                return;
            }

            thisClass.emailSetting.emailType = "Mailgun";
            thisClass.emailSetting.mailgun = {};
            thisClass.emailSetting.mailgun.key = mailgunkey;
            thisClass.emailSetting.mailgun.domain = mailgundomain;
            thisClass.emailSetting.mailgun.from = mailgunfrom;
        }
        else if(thisClass.currentEmailType == "Amazon")
        {
            var amazonkey = $('#uceditamazon_key').val(),
                amazonsecret = $('#uceditamazon_secret').val(),
                amazonregion = $('#uceditamazon_region').val(),
                amazonfrom = $('#uceditamazon_from').val();


            var validationResult = thisClass.validateAmazonInputs();

            if(validationResult.status == "failure")
            {
                alert(validationResult.msg);
                return;
            }

            thisClass.emailSetting.emailType = "Amazon";
            thisClass.emailSetting.amazon = {};
            thisClass.emailSetting.amazon.key = amazonkey;
            thisClass.emailSetting.amazon.secret = amazonsecret;
            thisClass.emailSetting.amazon.region = amazonregion;
            thisClass.emailSetting.amazon.from = amazonfrom;
        }

        thisClass.emailSetting.appId = uc_main.appController.currentAppId;

        $("#uceditmail_submit").button('loading');

        var user = UC_UserSession.user;

        UC_AJAX.call('EmailManager/saveemailsetting',{user:user,emailSetting:thisClass.emailSetting},function(data,status,xhr)
        {
            if(data)
            {
                if(data.status == "failure")
                {
                    alert("An Error accured while saving email settings!");
                }
                else if(data.status == "authenticationfailed")
                {
                    location.href="/";
                }
                else
                {
                    alert("Email settings changed successfully");
                    $("#ucEditMailModal").modal("hide");
                }

                $("#uceditmail_submit").button('reset');
            }

        });
    };

    /*
     *  @desc Handles the browser notification data validation and sends it to server
     */
    this.handleBrowserNotificationSaveAction = function(e)
    {
        e.preventDefault();

        var fcmKey = $('#uceditbrowsernotification_fcmkey').val(),
            fcmSenderId = $('#uceditbrowsernotification_fcmsenderid').val(),
            fcmAppName = $('#uceditbrowsernotification_fcmappname').val(),
            iconUrl = $('#uceditbrowsernotification_icon').val();

        thisClass.browserNotificationSetting.fcmKey = fcmKey;
        thisClass.browserNotificationSetting.fcmSenderId = fcmSenderId;
        thisClass.browserNotificationSetting.fcmAppName = fcmAppName;
        thisClass.browserNotificationSetting.icon = iconUrl;

        thisClass.browserNotificationSetting.appId = uc_main.appController.currentAppId;

        $("#uceditbrowsernotification_submit").button('loading');

        var user = UC_UserSession.user;

        UC_AJAX.call('BrowserNotificationManager/savebrowsernotificationsetting',{user:user,browserNotificationSetting:thisClass.browserNotificationSetting},function(data,status,xhr)
        {
            if(data)
            {
                if(data.status == "failure")
                {
                    alert("An Error accured while saving browser notification settings!");
                }
                else if(data.status == "authenticationfailed")
                {
                    location.href="/";
                }
                else
                {
                    alert("Browser Notification settings changed successfully");
                    $("#ucEditBrowserNotificationModal").modal("hide");
                }

                $("#uceditbrowsernotification_submit").button('reset');
            }

        });
    };

    /*
     * @desc Validate smtp data
     */
    this.validateSMTPInputs  = function()
    {
        var result = {status:"success",msg:""};

        var smtphost = $('#uceditsmtp_host').val(),
            smtpport = $('#uceditsmtp_port').val(),
            msg = "";

        if($.trim(smtphost) == "")
        {
            msg = "Invalid Host Name !";
        }
        else if($.trim(smtpport) == "")
        {
            msg = "Invalid Port !";
        }

        if(msg != "")
        {
            result.status = "failure";
            result.msg = msg;
        }

        return result;
    };

    /*
     * @desc Validate Mailgun data
     */
    this.validateMailgunInputs  = function()
    {
        var result = {status:"success",msg:""};

        var mailgunkey = $('#uceditmailgun_key').val(),
            mailgundomain = $('#uceditmailgun_domain').val(),
            mailgunfrom = $('#uceditmailgun_from').val(),
            msg = "";

        if($.trim(mailgunkey) == "")
        {
            msg = "Invalid Key";
        }
        else if($.trim(mailgundomain) == "")
        {
            msg = "Invalid Domain";
        }
        else if($.trim(mailgunfrom) == "")
        {
            msg = "Invalid From email";
        }

        if(msg != "")
        {
            result.status = "failure";
            result.msg = msg;
        }

        return result;
    };

    /*
     * @desc Validate Amazon SES data
     */
    this.validateAmazonInputs  = function()
    {
        var result = {status:"success",msg:""};

        var amazonkey = $('#uceditamazon_key').val(),
            amazonsecret = $('#uceditamazon_secret').val(),
            amazonregion = $('#uceditamazon_region').val(),
            amazonfrom = $('#uceditamazon_from').val(),
            msg = "";

        if($.trim(amazonkey) == "")
        {
            msg = "Invalid Key !";
        }
        else if($.trim(amazonsecret) == "")
        {
            msg = "Invalid Secret !";
        }
        else if($.trim(amazonregion) == "")
        {
            msg = "Invalid Region !";
        }
        else if($.trim(amazonfrom) == "")
        {
            msg = "Invalid From Email !";
        }

        if(msg != "")
        {
            result.status = "failure";
            result.msg = msg;
        }

        return result;
    };

    /*
     *  @desc Populates the form fields with the Database data
     */
    this.editDatabaseHandler = function(e)
    {
        $('#uceditdatabase_host').val(thisClass.config.database.host);
        $('#uceditdatabase_port').val(thisClass.config.database.port);
        $('#uceditdatabase_user').val(thisClass.config.database.user);
        $('#uceditdatabase_connectionstring').val(thisClass.config.database.connectionstring);

        $("#ucEditDatabaseTabGroup .uc_tab_trigger").removeClass("active");
        $("#ucEditDatabaseTabGroup .uc_tab_trigger[data-connectionType="+thisClass.config.database.connectiontype+"]").addClass("active");

        $(".ucEditDatabaseContainer").hide();
        $("#ucEditDatabase"+thisClass.config.database.connectiontype+"Container").show();

        $("#ucEditDatabaseModal").modal();

        $("#uceditdatabase_submit").button('reset');

        e.preventDefault();
    };

    /*
     *  @desc Handles the Database data validation and sends it to server
     */
    this.handleDatabaseSaveAction = function(e)
    {
        e.preventDefault();

        var databasehost = $('#uceditdatabase_host').val(),
            databaseport = $('#uceditdatabase_port').val(),
            databaseuser = $('#uceditdatabase_user').val(),
            databasepass = $('#uceditdatabase_pass').val(),
            databaseconnectionstring = $('#uceditdatabase_connectionstring').val(),
            databaseconnectiontype = $("#ucEditDatabaseTabGroup .active").attr("data-connectionType");


        var validationResult = thisClass.validateDatabaseInputs();

        if(validationResult.status == "failure")
        {
            alert(validationResult.msg);
            return;
        }

        thisClass.config.database.host = databasehost;
        thisClass.config.database.port = databaseport;
        thisClass.config.database.user = databaseuser;
        thisClass.config.database.pass = databasepass;
        thisClass.config.database.connectionstring = databaseconnectionstring;
        thisClass.config.database.connectiontype = databaseconnectiontype;

        $("#uceditdatabase_submit").button('loading');

        UC_AJAX.call('UserManager/verifydbconnection',{dbhost:databasehost,dbport:databaseport,dbuser:databaseuser,dbpass:databasepass,dbname:thisClass.config.database.name,dbconnectionstring:databaseconnectionstring,dbconnectiontype:databaseconnectiontype},function(data,status,xhr)
              {
                 if(data)
                 {
                     if(data.status == "connected")
                     {

                        UC_AJAX.call('UserManager/saveconfig',{config:thisClass.config},function(data,status,xhr)
                        {
                            if(data)
                            {
                                if(data.status == "failure")
                                {
                                    alert("An Error accured while saving config file!");
                                }
                                else
                                {
                                    alert("Database settings changed successfully");

                                    $("#ucEditDatabaseModal").modal("hide");
                                }

                                $("#uceditdatabase_submit").button('reset');
                            }

                        });

                     }
                     else if(data.status == "failure")
                     {
                         alert("Database connection cannot be established with the provided details");
                         $("#uceditdatabase_submit").button('reset');
                     }
                     else
                     {
                         alert("An Error accured while saving data. Try again!");
                         $("#uceditdatabase_submit").button('reset');
                     }
                 }

              });


    };

    /*
     * @desc Validate Database data
     */
    this.validateDatabaseInputs  = function()
    {
        var result = {status:"success",msg:""};

        var databasehost = $('#uceditdatabase_host').val(),
            databaseport = $('#uceditdatabase_port').val(),
            databaseconnectionstring = $('#uceditdatabase_connectionstring').val(),
            databaseconnectiontype = $("#ucEditDatabaseTabGroup .active").attr("data-connectionType"),
            msg = "";

        if(databaseconnectiontype == "Simple")
        {
            if($.trim(databasehost) == "")
            {
                msg = "Invalid Host Name !";
            }
            else if($.trim(databaseport) == "")
            {
                msg = "Invalid Port !";
            }
        }
        else if(databaseconnectiontype == "Advanced")
        {
            if($.trim(databaseconnectionstring) == "")
            {
                msg = "Invalid Connection String";
            }
        }
        else
        {
            msg = "Invalid Connection Type";
        }

        if(msg != "")
        {
            result.status = "failure";
            result.msg = msg;
        }

        return result;
    };

    /*
     *  @desc Populates the form fields with the System data
     */
    this.editSystemHandler = function(e)
    {
        $('#uceditsystem_baseurl').val(thisClass.config.baseURL);

        //Construct timezone list
        var timezoneList = moment.tz.names();
        $("#uceditsystem_timezoneinput").html("");
        $("#uceditsystem_timezoneinput").append('<option value="">Select a Timezone</option>');
        for(var i = 0; i < timezoneList.length; i++)
        {
            var selected = '';
            if(UC_UserSession.user.companyTimezone == timezoneList[i])
            {
                selected = ' selected';
            }

            $("#uceditsystem_timezoneinput").append('<option value="'+timezoneList[i]+'"'+selected+'>'+timezoneList[i]+' ('+moment.tz(timezoneList[i]).format("Z")+')</option>');
        }

        $("#uceditsystem_timezoneinput").select2();

        $("#ucEditSystemModal").modal();

        $("#uceditsystem_submit").button('reset');

        e.preventDefault();
    };

    /*
     *  @desc Handles the System data validation and sends it to server
     */
    this.handleSystemSaveAction = function(e)
    {
        e.preventDefault();

        var baseurl = $('#uceditsystem_baseurl').val(),
            timezone = $('#uceditsystem_timezoneinput').val();


        var validationResult = thisClass.validateSystemInputs();

        if(validationResult.status == "failure")
        {
            alert(validationResult.msg);
            return;
        }


        if(baseurl.substr(baseurl.length - 1) == "/")
        {
            baseurl = baseurl.substr(0,baseurl.length - 1);
        }

        thisClass.config.baseURL = baseurl;

        $("#uceditsystem_submit").button('loading');

        UC_AJAX.call('UserManager/saveconfig',{config:thisClass.config},function(data,status,xhr)
        {
            if(data)
            {
                if(data.status == "failure")
                {
                    alert("An Error accured while saving config file!");
                    $("#uceditsystem_submit").button('reset');
                }
                else
                {
                    UC_AJAX.call('UserManager/updateTimezone',{user:UC_UserSession.user,timezone:timezone},function(data,status,xhr){

                        if(data.status == "authenticationfailed")
                         {
                             location.href="/";
                         }
                         else if(data.status == "failure")
                         {
                             alert("An Error accured while saving data !");
                         }
                         else
                         {
                             alert("System settings changed successfully");
                             $("#ucEditSystemModal").modal("hide");
                         }
                         $("#uceditsystem_submit").button('reset');
                    });

                }

            }

        });
    };

    /*
     * @desc Validate System data
     */
    this.validateSystemInputs  = function()
    {
        var result = {status:"success",msg:""};

        var baseurl = $('#uceditsystem_baseurl').val(),
            timezone = $('#uceditsystem_timezoneinput').val(),
            msg = "";


        if(baseurl.substr(baseurl.length - 1) == "/")
        {
            baseurl = baseurl.substr(0,baseurl.length - 1);
        }

        if($.trim(baseurl) == "")
        {
            msg = "Invalid Base URL";
        }
        else if($.trim(timezone) == "")
        {
            msg = "Invalid Timezone";
        }

        if(msg != "")
        {
            result.status = "failure";
            result.msg = msg;
        }

        return result;
    };

    /*
     * @desc handles the change in type of email
     */
    this.handleTypeSelectionAction  = function()
    {
        thisClass.currentEmailType = $(this).attr("data-emailType");
    };

    /*
     * @desc Obtains the config and stores as local var
     */
    this.getConfig  = function()
    {
        UC_AJAX.call('UserManager/getconfig',{user:UC_UserSession.user},function(data,status,xhr)
        {
            thisClass.config = data.config;
        });
    };
}
