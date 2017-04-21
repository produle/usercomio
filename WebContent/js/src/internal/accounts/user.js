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

	this.constructor = function()
	{
        $(document).on("click",".ucEditProfile",thisClass.editProfileHandler);
        $(document).on("click",".ucChangePassword",thisClass.editPasswordHandler);
        $(document).on("click",".ucEditMail",thisClass.editMailHandler);
        $(document).on("click",".ucEditDatabase",thisClass.editDatabaseHandler);
        $(document).on("click",".ucEditSystem",thisClass.editSystemHandler);

		$(document).on("click","#uceditprofile_submit",thisClass.handleProfileSaveAction);
		$(document).on("click","#ucchangepassword_submit",thisClass.handlePasswordSaveAction);
		$(document).on("click","#uceditmail_submit",thisClass.handleMailSaveAction);
		$(document).on("click","#uceditdatabase_submit",thisClass.handleDatabaseSaveAction);
		$(document).on("click","#uceditsystem_submit",thisClass.handleSystemSaveAction);

		$(document).on("click","#ucEditEmailTypeTabGroup button",thisClass.handleTypeSelectionAction);
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

        e.preventDefault();
    };

    /*
     *  @desc Handles the user data validation and sends it to server
     */
    this.handleProfileSaveAction = function()
    {
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

        UC_AJAX.call('UserManager/saveUserProfile',{user:user},function(data,status,xhr)
        {
            if(data)
            {
                if(data.status == "failure")
                {
                    alert("An Error accured while saving data !");
                }
                else
                {
                    alert("Profile saved successfully");
                    uc_main.rivetUserNameObj.models.currentUserName = user.firstName+" "+user.lastName;

                    $("#ucEditProfileModal").modal("hide");
                }
            }

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
            msg = "Invalid First Name !";
        }
        else if($.trim(lastname) == "")
        {
            msg = "Invalid Last Name !";
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
        e.preventDefault();
    };

    /*
     *  @desc Handles the user data validation and sends it to server
     */
    this.handlePasswordSaveAction = function()
    {
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

        UC_AJAX.call('UserManager/saveUserPassword',{user:user},function(data,status,xhr)
        {
            if(data)
            {
                delete UC_UserSession.user.password; //To avoid the encrypted password transmitted to client

                if(data.status == "failure")
                {
                    alert("An Error accured while saving data !");
                }
                else
                {
                    alert("Password changed successfully");

                    $("#ucEditPasswordModal").modal("hide");
                }
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
        if(thisClass.config.emailType)
        {
            thisClass.currentEmailType = thisClass.config.emailType;
        }
        else
        {
            thisClass.currentEmailType = "SMTP";
        }

        $(".ucEditEmailContainer").hide();
        $("#ucEditEmail"+thisClass.currentEmailType+"Container").show();

        $("#ucEditEmailTypeTabGroup button").removeClass("active");
        $("#ucEditEmailTypeTabGroup button[data-tabgroup-tabid=ucEditEmail"+thisClass.currentEmailType+"Container]").addClass("active");

        if(thisClass.config.smtp)
        {
            $('#uceditsmtp_host').val(thisClass.config.smtp.host);
            $('#uceditsmtp_port').val(thisClass.config.smtp.port);
            $('#uceditsmtp_user').val(thisClass.config.smtp.user);
            $('#uceditsmtp_pass').val(thisClass.config.smtp.pass);
        }
        if(thisClass.config.mailgun)
        {
            $('#uceditmailgun_key').val(thisClass.config.mailgun.key);
            $('#uceditmailgun_domain').val(thisClass.config.mailgun.domain);
        }
        if(thisClass.config.amazon)
        {
            $('#uceditamazon_key').val(thisClass.config.amazon.key);
            $('#uceditamazon_secret').val(thisClass.config.amazon.secret);
        }

        $("#ucEditMailModal").modal();

        e.preventDefault();
    };

    /*
     *  @desc Handles the email data validation and sends it to server
     */
    this.handleMailSaveAction = function()
    {
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

            thisClass.config.emailType = "SMTP";
            thisClass.config.smtp.host = smtphost;
            thisClass.config.smtp.port = smtpport;
            thisClass.config.smtp.user = smtpuser;
            thisClass.config.smtp.pass = smtppass;
        }
        else if(thisClass.currentEmailType == "Mailgun")
        {
            var mailgunkey = $('#uceditmailgun_key').val(),
                mailgundomain = $('#uceditmailgun_domain').val();


            var validationResult = thisClass.validateMailgunInputs();

            if(validationResult.status == "failure")
            {
                alert(validationResult.msg);
                return;
            }

            thisClass.config.emailType = "Mailgun";
            thisClass.config.mailgun = {};
            thisClass.config.mailgun.key = mailgunkey;
            thisClass.config.mailgun.domain = mailgundomain;
        }
        else if(thisClass.currentEmailType == "Amazon")
        {
            var amazonkey = $('#uceditamazon_key').val(),
                amazonsecret = $('#uceditamazon_secret').val();


            var validationResult = thisClass.validateAmazonInputs();

            if(validationResult.status == "failure")
            {
                alert(validationResult.msg);
                return;
            }

            thisClass.config.emailType = "Amazon";
            thisClass.config.amazon = {};
            thisClass.config.amazon.key = amazonkey;
            thisClass.config.amazon.secret = amazonsecret;
        }

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
                    alert("Email settings changed successfully");
                    $("#ucEditMailModal").modal("hide");
                }
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
            msg = "";

        if($.trim(mailgunkey) == "")
        {
            msg = "Invalid Key";
        }
        else if($.trim(mailgundomain) == "")
        {
            msg = "Invalid Domain";
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
            msg = "";

        if($.trim(amazonkey) == "")
        {
            msg = "Invalid Key !";
        }
        else if($.trim(amazonsecret) == "")
        {
            msg = "Invalid Secret !";
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

        $("#ucEditDatabaseModal").modal();

        e.preventDefault();
    };

    /*
     *  @desc Handles the Database data validation and sends it to server
     */
    this.handleDatabaseSaveAction = function()
    {
        var databasehost = $('#uceditdatabase_host').val(),
            databaseport = $('#uceditdatabase_port').val(),
            databaseuser = $('#uceditdatabase_user').val(),
            databasepass = $('#uceditdatabase_pass').val();


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

        UC_AJAX.call('UserManager/verifydbconnection',{dbhost:databasehost,dbport:databaseport,dbuser:databaseuser,dbpass:databasepass,dbname:thisClass.config.database.name},function(data,status,xhr)
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
                            }

                        });

                     }
                     else if(data.status == "failure")
                     {
                         alert("Database connection cannot be established with the provided details");
                     }
                     else
                     {
                         alert("An Error accured while saving data. Try again!");
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
            msg = "";

        if($.trim(databasehost) == "")
        {
            msg = "Invalid Host Name !";
        }
        else if($.trim(databaseport) == "")
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
     *  @desc Populates the form fields with the System data
     */
    this.editSystemHandler = function(e)
    {
        $('#uceditsystem_baseurl').val(thisClass.config.baseURL);

        $("#ucEditSystemModal").modal();

        e.preventDefault();
    };

    /*
     *  @desc Handles the System data validation and sends it to server
     */
    this.handleSystemSaveAction = function()
    {
        var baseurl = $('#uceditsystem_baseurl').val();


        var validationResult = thisClass.validateSystemInputs();

        if(validationResult.status == "failure")
        {
            alert(validationResult.msg);
            return;
        }

        thisClass.config.baseURL = baseurl;

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
                    alert("System settings changed successfully");
                    $("#ucEditSystemModal").modal("hide");
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
            msg = "";

        if($.trim(baseurl) == "")
        {
            msg = "Invalid Host Name !";
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
}
