$(document).ready(function(){


	var token = UC_Utils.getParameterByName('token');

	if(!token || $.trim(token).length ==0)
	{
		alert('Invalid !.Please reset password again from login page.')

		return;
	}

	$('#ucuserpassreset_submitbtn').on('click',function(){

		var newpassword = $('#ucuserpassreset_newpasswordinput').val();
		var confirmpassword = $('#ucuserreg_confirmpasswordinput').val();

		if($.trim(newpassword).length == 0)
		{
			alert('Invalid Password !');

			return;
		}

		if($.trim(newpassword) != $.trim(confirmpassword))
		{
			alert("New Password and Confirm Password doesn't match !");

			return;
		}

		var password  = $('#ucuserpassreset_newpasswordinput').val();

		UC_AJAX.call('LoginManager/resetPassword',{password:password,token:token},function(data,status,xhr)
	  		      {
					 if(data.status == "failure")
			    	  {
			    		  alert("An error accured !")
			    		  return;
			    	  }

	  		    	  if(data.status == "success")
	  		          {
	  		    		  location.href = "/login";
	  		          }



	  		      });




	});


});
