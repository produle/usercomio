/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the user related curd operations
 *
 */

function UC_UserController()
{
	var thisClass = this;

	this.constructor = function()
	{
		$(document).on("click","#uceditprofile_submit",thisClass.handleProfileSaveAction);
		$(document).on("click","#ucchangepassword_submit",thisClass.handlePasswordSaveAction);
	};

    /*
     *  @desc Populates the form fields with the user object data
     */
    this.editProfileHandler = function()
    {
        var user = UC_UserSession.user;
        $('#uceditprofile_firstname').val(user.firstName);
        $('#uceditprofile_lastname').val(user.lastName);
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
                if(data.status == "failure")
                {
                    alert("An Error accured while saving data !");
                }
                else
                {
                    alert("Password changed successfully");
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
}
