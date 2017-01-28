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
  }

  /*
  *  @desc Handles click event of login button
  */
  this.handleLoginBtnAction = function()
  {
    var username = $('#uclogin_usernameinput').val();
    var password = $('#uclogin_passwordinput').val();

    var loginObj = {
        username : username,
        password : password
    }

    thisClass.sendLoginRequest(loginObj);
  }

  /*
  *  @desc Makes an ajax request to login function
  */
  this.sendLoginRequest = function(loginObj)
  {
    if(loginObj.username && loginObj.password)
    {
	    UC_AJAX.call('LoginManager/validateUser',{username:loginObj.username,password:loginObj.password},function(data,status,xhr)
	      {
	    	  if(data)
	          {
	    		  
	    		  if(data.error)
	    		  {
	    			  alert(data.error)
	    		  }
	    		  else
    			  {
	    			var uc_user = new UC_User();
	    				
	  	            uc_user.cast(data);
	  	
	  	            UC_UserSession.user = uc_user;
	  	
	  	            location.href  = "/"
    			  }
	            
	          }
	
	      });
	      
      
    }
    else
    {
        throw "username or password  was not provided."
    }

  }

 

}
