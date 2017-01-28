/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 * @desc Handles all the user registration related code example register new user etc
 */

function UC_UserRegistrationController()
{
  var thisClass = this;

  this.constructor = function()
  {
     this.bindUIEvents();
  }

  this.bindUIEvents = function()
  {
    $('#ucuserreg_submitbtn').on('click',thisClass.handleRegisterBtnAction);
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
    
    newUser.username = email;
    newUser.firstName = fullname;
    newUser.password = password;
    newUser.company = 'C'+UC_Utils.guidGenerator();
    

    thisClass.sendLoginRequest(newUser);
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
  this.sendLoginRequest = function(newUser)
  {
	  
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
				 location.href = "/login";
			 }
		 }

	  });;
	  
  
    }
   
}

