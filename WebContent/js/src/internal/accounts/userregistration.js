/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 * @desc Handles all the user registration related code example register new user etc
 */

function UC_UserRegistrationController()
{
    var thisClass = this;

    this.config = {};

    this.setupappId = "";

    this.timezoneList = "";

  this.constructor = function()
  {
     this.bindUIEvents();

      //$("#UC_Setup_Database").show();
     $("#UC_Setup_Welcome_Page").show();

      thisClass.constructTimezoneArray();

  }

  this.bindUIEvents = function()
  {

	$('#ucsetup_getting_startedbtn').on('click',thisClass.handleGettingStartedBtnAction);
    $('#ucuserreg_submitbtn').on('click',thisClass.handleRegisterBtnAction);
    $('#ucsetup_dbsubmitbtn').on('click',thisClass.handleSetupDBAction);
    $('#ucsetup_usersubmitbtn').on('click',thisClass.handleSetupUserAction);
    $('#ucsetup_appsubmitbtn').on('click',thisClass.handleSetupAppAction);
    $('#ucsetup_smtpsubmitbtn').on('click',thisClass.handleSetupSMTPAction);
  }

  this.handleGettingStartedBtnAction = function()
  {
	  $(".UC_SetupContainerCls").hide();
	  $("#UC_Setup_Database").show();
	  $(".ucSetupProgressSteps li").removeClass("active");
	  $(".uc_database_details").addClass("active");

      $('#ucSetupDatabaseAjaxLoader').hide();
  }
  /*
  *  @desc Handles click event of login button
  */
  this.handleRegisterBtnAction = function()
  {
	var email = $('#ucuserreg_emailinput').val(),
		password = $('#ucuserreg_passwordinput').val(),
		confirmPassword = $('#ucuserreg_confirmpasswordinput').val(),
		fullname  = $('#ucuserreg_fullnameinput').val();


    var validationResult = thisClass.validateUserRegistrationInputs();

    if(validationResult.status == "failure")
    {
    	alert(validationResult.msg);
    	return;
    }

    var newUser = new UC_User();

    newUser._id = email;
    newUser.username = email;
    newUser.firstName = fullname;
    newUser.password = password;
    newUser.company = 'C'+UC_Utils.guidGenerator();


    thisClass.sendLoginRequest(newUser,true);
  }

  /*
   * @desc Validate user inputs
   */
  this.validateUserRegistrationInputs  = function()
  {
	  var result = {status:"success",msg:""};

	  var email = $('#ucuserreg_emailinput').val(),
	      password = $('#ucuserreg_passwordinput').val(),
	      confirmPassword = $('#ucuserreg_confirmpasswordinput').val(),
	      fullname  = $('#ucuserreg_fullnameinput').val(),
	  	  msg = "";

	  if($.trim(fullname) == "")
	  {
		  msg = "Invalid Name !";
	  }
	  else if($.trim(email) == "" || !UC_Utils.isValidEmail(email))
	  {
		  msg = "Invalid Email !";
	  }
	  else if($.trim(password) == "")
	  {
		  msg = "Invalid Password !";
	  }
	  else if(password != confirmPassword)
      {
	  	msg = "Password & Confirm Password doesn't match !";
      }

	  if(msg != "")
	  {
		  result.status = "failure";
		  result.msg = msg;
	  }

	  return result;
  }

  /*
  *  @desc Makes an ajax request to login function
  */
  this.sendLoginRequest = function(newUser,isRedirect)
  {

      if(!isRedirect)
      {
          $('#ucSetupUserAjaxLoader').show();
      }

	  UC_AJAX.call('UserManager/registerUser',{user:newUser},function(data,status,xhr)
	  {
		 if(data)
		 {
			 if(data.status == "userexists")
			 {
				 alert("Username already exists !");
			 }
			 else if(data.status == "failure")
			 {
				 alert("An Error accured while saving data !");
			 }
			 else
			 {
                 if(isRedirect)
                 {
                     location.href = "/login";
                 }
                 else
                 {
                     UC_UserSession.user = newUser;

                     $(".UC_SetupContainerCls").hide();
                     $("#UC_Setup_App").show();
                     $(".ucSetupProgressSteps li").removeClass("active");
               	  	 $(".uc_user_settings").addClass("active");
                     $("#UC_Setup_Progress_Step").text("3");

                     $('#ucSetupUserAjaxLoader').hide();
                     $('#ucSetupAppAjaxLoader').hide();

                 }
			 }
		 }

	  });;


    }

  /*
  *  @desc Handles database connection validation and saving to config
  */
  this.handleSetupDBAction = function()
  {
	var dbhost  = $('#ucsetup_dbhostinput').val(),
	      dbport  = $('#ucsetup_dbportinput').val(),
	      dbuser  = $('#ucsetup_dbuserinput').val(),
	      dbpass  = $('#ucsetup_dbpassinput').val(),
	      dbname  = $('#ucsetup_dbnameinput').val();


    var validationResult = thisClass.validateSetupDBInputs();

    if(validationResult.status == "failure")
    {
    	alert(validationResult.msg);
    	return;
    }

    $('#ucSetupDatabaseAjaxLoader').show();

    UC_AJAX.call('UserManager/verifydbconnection',{dbhost:dbhost,dbport:dbport,dbuser:dbuser,dbpass:dbpass,dbname:dbname},function(data,status,xhr)
	  {
		 if(data)
		 {
			 if(data.status == "connected")
			 {

                thisClass.config.database= {};
                thisClass.config.database.host = dbhost;
                thisClass.config.database.port = dbport;
                thisClass.config.database.user = dbuser;
                thisClass.config.database.pass = dbpass;
                thisClass.config.database.name = dbname;

                 thisClass.saveConfig(false);

                 $(".UC_SetupContainerCls").hide();
                 $("#UC_Setup_User").show();
                 $("#UC_Setup_Progress_Step").text("2");
                 $(".ucSetupProgressSteps li").removeClass("active");
                 $(".uc_admin_details").addClass("active");

                 $('#ucSetupEmailAjaxLoader').hide();

			 }
			 else if(data.status == "failure")
			 {
				 alert("Database connection cannot be established with the provided details");
			 }
			 else
			 {
				 alert("An Error accured while saving data. Try again!");
			 }

             $('#ucSetupDatabaseAjaxLoader').hide();
		 }

	  });
  }

  /*
  *  @desc Handles SMTP data and saves it to the config
  */
  this.handleSetupSMTPAction = function()
  {
      var smtphost  = $('#ucsetup_smtphostinput').val(),
	      smtpport  = $('#ucsetup_smtpportinput').val(),
	      smtpuser  = $('#ucsetup_smtpuserinput').val(),
	      smtppass  = $('#ucsetup_smtppassinput').val();

      var emailSettings = {
          emailType : "SMTP",
          smtp: {
            host : smtphost,
            port : smtpport,
            user : smtpuser,
            pass : smtppass
          },
          appId: thisClass.setupappId
      };

      var user = UC_UserSession.user;

      var emailSettings;

      UC_AJAX.call('EmailManager/getemailsetting',{appId:thisClass.setupappId,company:user.company },function(data,status,xhr)
    		  {
    			 if(data)
    			 {
    				 if(data.status == "failure")
    				 {
    	                 alert("Error in adding Email settings");
    				 }
    				 else
    				 {
    					 emailSettings = data.emailsetting;
    				      UC_AJAX.call('EmailManager/saveemailsetting',{user:user,emailSetting:emailSettings},function(data,status,xhr)
    				    		  {
    				    			 if(data)
    				    			 {
    				    				 if(data.status == "failure")
    				    				 {
    				    	                 alert("Error in adding Email settings");

    				    				 }
    				    	             else if(data.status == "authenticationfailed")
    				    	             {
    				    	                 location.href="/";
    				    	             }
    				    				 else
    				    				 {
    				    					 thisClass.saveConfig(true);
    				    				  }
    				    			 }
    				     });
    				 }
    			 }
    		  });

  }

  /*
  *  @desc Handles the user credential validation and sends it to server
  */
  this.handleSetupUserAction = function()
  {


	var email = $('#ucsetup_emailinput').val(),
		password = $('#ucsetup_passwordinput').val(),
		confirmPassword = $('#ucsetup_confirmpasswordinput').val(),
		fullname  = $('#ucsetup_fullnameinput').val();


    var validationResult = thisClass.validateSetupUserInputs();

    if(validationResult.status == "failure")
    {
    	alert(validationResult.msg);
    	return;
    }

    var newUser = new UC_User();

    newUser._id = email;
    newUser.username = email;
    newUser.firstName = fullname;
    newUser.password = password;
    newUser.password = password;
    newUser.company = 'C'+UC_Utils.guidGenerator();

    thisClass.sendLoginRequest(newUser,false);
  }

  /*
  *  @desc Handles app info validation and saves it to server
  */
  this.handleSetupAppAction = function()
  {
	var baseurl = $('#ucsetup_baseurlinput').val(),
		appName = $('#ucsetup_appnameinput').val();


    var validationResult = thisClass.validateSetupAppInputs();

    if(validationResult.status == "failure")
    {
    	alert(validationResult.msg);
    	return;
    }


    thisClass.config.baseURL= baseurl;
    thisClass.config.setupCompleted = 1;

    var newApp = new UC_App();
    var user = UC_UserSession.user;

    newApp.name = appName;
    newApp.creator = user.username;
    newApp._id = UC_Utils.guidGenerator();
    newApp.clientId = user.company;

    thisClass.setupappId =  newApp._id;

    $('#ucSetupAppAjaxLoader').show();

    UC_AJAX.call('AppManager/createNewApp',{newApp:newApp,user:user},function(data,status,xhr){

        if(data.status == "appexists")
         {
             alert("App with this name already exists !");
         }
         else if(data.status == "authenticationfailed")
         {
             location.href="/";
         }
         else if(data.status == "failure")
         {
             alert("An Error accured while saving data !");
         }
         else
         {
			 $(".UC_SetupContainerCls").hide();
             $("#UC_Setup_SMTP").show();
             $("#UC_Setup_Progress_Step").text("4");
             $(".ucSetupProgressSteps li").removeClass("active");
             $(".uc_smtp_details").addClass("active");
             UC_UserSession.user.company = data.status.clientId;
         }
         $('#ucSetupAppAjaxLoader').hide();
    });
  }

  /*
   * @desc Validate user inputs
   */
  this.validateSetupDBInputs  = function()
  {
	  var result = {status:"success",msg:""};

	  var dbhost  = $('#ucsetup_dbhostinput').val(),
	      dbport  = $('#ucsetup_dbportinput').val(),
	      dbuser  = $('#ucsetup_dbuserinput').val(),
	      dbpass  = $('#ucsetup_dbpassinput').val(),
	      dbname  = $('#ucsetup_dbnameinput').val(),
	  	  msg = "";

	  if($.trim(dbhost) == "")
	  {
		  msg = "Invalid Database Host !";
	  }
	  else if($.trim(dbport) == "")
	  {
		  msg = "Invalid Database Port !";
	  }
	  else if($.trim(dbname) == "")
	  {
		  msg = "Invalid Database Name !";
	  }

	  if(msg != "")
	  {
		  result.status = "failure";
		  result.msg = msg;
	  }

	  return result;
  }

  /*
   * @desc Validate user inputs
   */
  this.validateSetupUserInputs  = function()
  {
	  var result = {status:"success",msg:""};

	  var email = $('#ucsetup_emailinput').val(),
	      password = $('#ucsetup_passwordinput').val(),
	      confirmPassword = $('#ucsetup_confirmpasswordinput').val(),
	      fullname  = $('#ucsetup_fullnameinput').val(),
	  	  msg = "";

	  if($.trim(fullname) == "")
	  {
		  msg = "Invalid Name !";
	  }
	  else if($.trim(email) == "" || !UC_Utils.isValidEmail(email))
	  {
		  msg = "Invalid Email !";
	  }
	  else if($.trim(password) == "")
	  {
		  msg = "Invalid Password !";
	  }
	  else if(password != confirmPassword)
      {
	  	msg = "Password & Confirm Password doesn't match !";
      }

	  if(msg != "")
	  {
		  result.status = "failure";
		  result.msg = msg;
	  }

	  return result;
  }

  /*
   * @desc Validate user inputs
   */
  this.validateSetupAppInputs  = function()
  {
	  var result = {status:"success",msg:""};

	  var baseurl  = $('#ucsetup_baseurlinput').val(),
	      appname  = $('#ucsetup_appnameinput').val(),
	  	  msg = "";

	  if($.trim(baseurl) == "")
	  {
		  msg = "Invalid Base URL !";
	  }
	  else if($.trim(appname) == "")
	  {
		  msg = "Invalid App Name !";
	  }

	  if(msg != "")
	  {
		  result.status = "failure";
		  result.msg = msg;
	  }

	  return result;
  }

  /*
  *  @desc Saves the config data to the server
  */
  this.saveConfig = function(isRedirect)
  {

	  UC_AJAX.call('UserManager/saveconfig',{config:thisClass.config},function(data,status,xhr)
	  {
		 if(data)
		 {
			 if(data.status == "failure")
			 {
				 alert("An Error accured while saving config file!");
			 }
			 else if(isRedirect)
             {
                 //Timeout provided as the server restarts on saving config file, redirecting immediately will lead to Service Not Found error
                 setTimeout(function(){
                     location.href = "/";
                 },2000);
             }
		 }
          $('#ucSetupUserAjaxLoader').hide();

	  });


    }

    /*
     * @desc Parses the timezone list string and forms an array
     */
    this.constructTimezoneArray = function()
    {
        var timezoneNameArray = thisClass.timezoneList.split(",");
        for(var i = 0; i < timezoneNameArray.length; i++)
        {
            console.log(moment.tz(timezoneNameArray[i]).format("Z"));
        }

    }
}

