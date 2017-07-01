/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the browser notification message related operations
 *
 */

function UC_BrowserNotificationController()
{
	var thisClass = this;

    this.rivetBrowserNotificationTemplateListObj = null;

    this.browserNotificationTemplateList = [];

	this.constructor = function()
	{
		$(document).on("click","#ucSendMessageBrowserNotificationSubmit",thisClass.submitBrowserNotificationMessageHandler);

        $(document).on("change","#ucSendMessageBrowserNotificationTemplate",thisClass.templateChangeHandler);

        $(document).on("click","#ucDeleteBrowserNotificationTemplateBtn",thisClass.deleteTemplateHandler);

		thisClass.rivetBrowserNotificationTemplateListObj = rivets.bind(
            document.querySelector('#ucSendMessageBrowserNotificationTemplate'), {
                browserNotificationTemplateList: thisClass.browserNotificationTemplateList
            }
        );
	};

    this.getBrowserNotificationTemplates = function()
    {
        UC_AJAX.call('BrowserNotificationManager/getbrowsernotificationtemplates',{appid:uc_main.appController.currentAppId,user:UC_UserSession.user},function(data,status,xhr){

            if(data.status == "failure")
            {
                alert("Could not get browser notifications templates, please try again later");
            }
            else if(data.status == "authenticationfailed")
            {
                location.href="/";
            }
            else
            {
                thisClass.browserNotificationTemplateList = data.browserNotificationTemplateList;
                thisClass.rivetBrowserNotificationTemplateListObj.models.browserNotificationTemplateList = thisClass.browserNotificationTemplateList;

                $('#ucSendMessageBrowserNotificationTemplate option:eq(0)').prop('selected', true);
                $("#ucSendMessageBrowserNotificationTitle,#ucSendMessageBrowserNotificationLink,#ucSendMessageBrowserNotificationBody").val("");
            }
        });
    };

    this.submitBrowserNotificationMessageHandler = function()
    {
        var subject = $("#ucSendMessageBrowserNotificationTitle").val();
        var link = $("#ucSendMessageBrowserNotificationLink").val();
        var message = $("#ucSendMessageBrowserNotificationBody").val();
        var template = $("#ucSendMessageBrowserNotificationTemplate").val();
        var blockDuplicate = false;

        if($("#ucSendMessageBrowserNotificationBlockDuplicate").is(":checked"))
        {
            blockDuplicate = true;
        }

        var validationResult = thisClass.validateSendMessageBrowserNotificationInputs();

        if(validationResult.status == "failure")
        {
            alert(validationResult.msg);
            return;
        }

        uc_main.messagingController.sendMessageHandler(subject,message,template,link,blockDuplicate,"browsernotification","","");
    };

    /*
     * @desc Populates the body of message with the selected template content
     */
    this.templateChangeHandler = function()
    {
        if($(this).val()=="new")
        {
            $("#ucSendMessageBrowserNotificationTitle,#ucSendMessageBrowserNotificationLink,#ucSendMessageBrowserNotificationBody").val("");
            $("#ucDeleteBrowserNotificationTemplateBtn").hide();
            $("#ucSendMessageBrowserNotificationTemplate").removeClass("ucExistTemplate");
        }
        else
        {
            $("#ucSendMessageBrowserNotificationTitle").val($(this).find("option:selected").text());
            $("#ucSendMessageBrowserNotificationLink").val($(this).find("option:selected").attr("data-templatelink"));
            $("#ucSendMessageBrowserNotificationBody").val($(this).find("option:selected").attr("data-templatebody"));
            $("#ucDeleteBrowserNotificationTemplateBtn").show();
            $("#ucSendMessageBrowserNotificationTemplate").addClass("ucExistTemplate");
        }
    }

    /*
     * @desc Removes the selected template
     */
    this.deleteTemplateHandler = function()
    {

        var templateId = $("#ucSendMessageBrowserNotificationTemplate").val();

        if(templateId != "new")
        {
            if(confirm("Are you sure you want to delete the template?"))
            {
                $('#ucSendMessageAjaxLoader').show();

                UC_AJAX.call('BrowserNotificationManager/deletetemplate',{appid:uc_main.appController.currentAppId,user:UC_UserSession.user,templateId:templateId},function(data,status,xhr){

                    if(data.status == "failure")
                    {
                        alert("Could not delete template");
                    }
                    else if(data.status == "authenticationfailed")
                    {
                        location.href="/";
                    }
                    else
                    {
                        $("#ucSendMessageModal").modal("hide");

                    }

                    $('#ucSendMessageAjaxLoader').hide();
                });
            }
        }

    }

  /*
   * @desc Validate user inputs
   */
  this.validateSendMessageBrowserNotificationInputs  = function()
  {
	  var result = {status:"success",msg:""};

	  var subject = $("#ucSendMessageBrowserNotificationTitle").val(),
          link = $("#ucSendMessageBrowserNotificationLink").val(),
          message = $("#ucSendMessageBrowserNotificationBody").val(),
	  	  msg = "";

	  if($.trim(subject) == "")
	  {
		  msg = "Subject is required";
	  }
	  else if($.trim(link) == "")
	  {
		  msg = "Link is required";
	  }
	  else if($.trim(message) == "")
	  {
		  msg = "Message is required";
	  }

	  if(msg != "")
	  {
		  result.status = "failure";
		  result.msg = msg;
	  }

	  return result;
  }
}
