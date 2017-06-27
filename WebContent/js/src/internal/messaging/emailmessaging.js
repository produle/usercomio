/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the email message related operations
 *
 */

function UC_EmailMessagingController()
{
	var thisClass = this;

    this.rivetEmailTemplateListObj = null;

    this.emailTemplateList = [];

    this.sendtype = "now";

	this.constructor = function()
	{
		$(document).on("click","#ucSendMessageEmailSubmit",thisClass.submitEmailMessageHandler);

        $(document).on("change","#ucSendMessageEmailTemplate",thisClass.templateChangeHandler);

        $(document).on("click","#ucDeleteEmailTemplateBtn",thisClass.deleteTemplateHandler);

		thisClass.rivetEmailTemplateListObj = rivets.bind(
            document.querySelector('#ucSendMessageEmailTemplate'), {
                emailTemplateList: thisClass.emailTemplateList
            }
        );

        var maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        $("#ucSendMessageEmailScheduleDatetime").datetimepicker({
            minDate : new Date(),
            maxDate : maxDate,
            step: 5
        });

        $(".ucSendMessageEmailSendTypeItem").click(function(){

            thisClass.sendtype = $(this).attr("data-sendtype");
            if($(this).attr("data-sendtype") == "later")
            {
                $("#ucSendMessageEmailScheduleContainer").show();
                $("#ucSendMessageEmailSubmit").text("Send Later");
            }
            else
            {
                $("#ucSendMessageEmailScheduleContainer").hide();
                $("#ucSendMessageEmailSubmit").text("Send Now");
            }
            $(".ucSendMessageEmailSendTypeItem").show();
            $(this).hide();
        });
	};

    this.getEmailTemplates = function()
    {
        UC_AJAX.call('EmailManager/getemailtemplates',{appid:uc_main.appController.currentAppId,user:UC_UserSession.user},function(data,status,xhr){

            if(data.status == "failure")
            {
                alert("Could not get email templates, please try again later");
            }
            else if(data.status == "authenticationfailed")
            {
                location.href="/";
            }
            else
            {
                thisClass.emailTemplateList = data.emailTemplateList;
                thisClass.rivetEmailTemplateListObj.models.emailTemplateList = thisClass.emailTemplateList;

                $('#ucSendMessageEmailTemplate option:eq(0)').prop('selected', true);
                $("#ucSendMessageEmailSubject,#ucSendMessageEmailBody").val("");
            }
        });
    };

    this.submitEmailMessageHandler = function()
    {
        var subject = $("#ucSendMessageEmailSubject").val();
        var message = $("#ucSendMessageEmailBody").val();
        var template = $("#ucSendMessageEmailTemplate").val();
        var scheduledatetime = $("#ucSendMessageEmailScheduleDatetime").val();
        var blockDuplicate = false;

        if($("#ucSendMessageEmailBlockDuplicate").is(":checked"))
        {
            blockDuplicate = true;
        }

        var validationResult = thisClass.validateSendMessageEmailInputs();

        if(validationResult.status == "failure")
        {
            alert(validationResult.msg);
            return;
        }

        uc_main.messagingController.sendMessageHandler(subject,message,template,"",blockDuplicate,"email",thisClass.sendtype,scheduledatetime);
    };

    /*
     * @desc Populates the body of message with the selected template content
     */
    this.templateChangeHandler = function()
    {
        if($(this).val()=="new")
        {
            $("#ucSendMessageEmailSubject,#ucSendMessageEmailBody").val("");
            $("#ucDeleteEmailTemplateBtn").hide();
            $("#ucSendMessageEmailTemplate").removeClass("ucExistTemplate");
        }
        else
        {
            $("#ucSendMessageEmailSubject").val($(this).find("option:selected").text());
            $("#ucSendMessageEmailBody").val($(this).find("option:selected").attr("data-templatebody"));
            $("#ucDeleteEmailTemplateBtn").show();
            $("#ucSendMessageEmailTemplate").addClass("ucExistTemplate");
        }
    }

    /*
     * @desc Removes the selected template
     */
    this.deleteTemplateHandler = function()
    {

        var templateId = $("#ucSendMessageEmailTemplate").val();

        if(templateId != "new")
        {
            if(confirm("Are you sure you want to delete the template?"))
            {
                $('#ucSendMessageAjaxLoader').show();

                UC_AJAX.call('EmailManager/deletetemplate',{appid:uc_main.appController.currentAppId,user:UC_UserSession.user,templateId:templateId},function(data,status,xhr){

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
  this.validateSendMessageEmailInputs  = function()
  {
	  var result = {status:"success",msg:""};

	  var subject = $("#ucSendMessageEmailSubject").val(),
          message = $("#ucSendMessageEmailBody").val(),
          scheduledatetime = $("#ucSendMessageEmailScheduleDatetime").val(),
	  	  msg = "";

	  if($.trim(subject) == "")
	  {
		  msg = "Subject is required";
	  }
	  else if($.trim(message) == "")
	  {
		  msg = "Message is required";
	  }

      if(thisClass.sendtype == "later" && $.trim(scheduledatetime) == "")
      {
		  msg = "Schedule Date and Time required";
	  }

	  if(msg != "")
	  {
		  result.status = "failure";
		  result.msg = msg;
	  }

	  return result;
  }

    /*
     * @desc Initializes the settings for sending type on modal load
     */
    this.initSendTypeSettings = function()
    {
        thisClass.sendtype = "now";
        $("#ucSendMessageEmailScheduleContainer").hide();
        $("#ucSendMessageEmailSubmit").text("Send Now");
        $(".ucSendMessageEmailSendTypeItem").show();
        $(".ucSendMessageEmailSendTypeItem[data-sendtype=now]").hide();
    }
}
