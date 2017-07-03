/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the login related code example forget pass,user login etc
 *
 */

function UC_LoginController()
{
  var thisClass = this;

  this.constructor = function()
  {
     this.bindUIEvents();
  }

  this.bindUIEvents = function()
  {
    $('#uclogin_submitbtn').on('click',thisClass.handleLoginBtnAction);
    $('#uclogin_forgotpasswordbtn').on('click',thisClass.handleForgotPasswordBtnAction)
  }

  /*
  *  @desc Handles click event of login button
  */
  this.handleLoginBtnAction = function(e)
  {
      e.preventDefault();

    var username = $('#uclogin_usernameinput').val();
    var password = $('#uclogin_passwordinput').val();

    var loginObj = {
        username : username,
        password : password
    }

    thisClass.sendLoginRequest(loginObj);
  };

  /*
  *  @desc Makes an ajax request to login function
  */
  this.sendLoginRequest = function(loginObj)
  {
    if(loginObj.username && loginObj.password)
    {

        $("#uclogin_submitbtn").hide();
        $("#ucLogin_loader").show();
	    UC_AJAX.call('LoginManager/validateUser',{username:loginObj.username,password:loginObj.password},function(data,status,xhr)
	      {
	    	  if(data)
	          {

	    		  if(data.error)
	    		  {
	    			  alert(data.error);
                      $("#ucLogin_loader").hide();
                      $("#uclogin_submitbtn").show();
	    		  }
	    		  else
    			  {
	                  location.href  = "/"
    			  }

	          }

	      });


    }
    else
    {
        alert("Username and Password are required");
    }


  };

  /*
   * @desc Handles forgot password btn click event
   */
  this.handleForgotPasswordBtnAction = function()
  {
  	var email = $('#uclogin_usernameinput').val();
  	var token = UC_Utils.guidGenerator();


  	if($.trim(email).length == 0)
  	{
  		alert('Email is required !')
  		return;
  	}

  	 UC_AJAX.call('LoginManager/forgotPassword',{email:email,token:token},function(data,status,xhr)
  		      {
  		    	  if(data)
  		          {
  		    		  if(data.status == "success")
  		    		  {
  		    			  alert('Check E-mail for resetting Password.  (If not received check Spam folder) ');
  		    			  return;
  		    		  }

  		    		  if(data.status == "failure")
  		    		  {
  		    			  alert('An error accured !');
		    			  return;
  		    		  }

  		          }

  		      });

  }



}
