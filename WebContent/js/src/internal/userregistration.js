/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the login related code example forget pass,user login etc
 *
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
    var username = $('#ucuserreg_usernameinput').val();
    var password = $('#ucuserreg_passwordinput').val();

    var regObj = {
        username : username,
        password : password,
        successCallback : thisClass.registerSuccess
    }

    thisClass.sendLoginRequest(regObj);
  }

  /*
  *  @desc Makes an ajax request to login function
  */
  this.sendLoginRequest = function(regObj)
  {
    if(regObj.username && regObj.password)
    {
      var reqObj =  {
          endpoint : 'user/register',
          data : {username:regObj.username,password:regObj.password}
      }

      UC_AJAX.post(reqObj,regObj.successCallback);
    }
    else
    {
        throw "username or password  was not provided."
    }

  },

  this.registerSuccess = function(data,status,xhr)
  {

      if(data)
      {

        location.href  = "/login"
      }

  }

}
