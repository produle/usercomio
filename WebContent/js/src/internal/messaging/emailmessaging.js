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
                $("#ucSendMessageEmailSubject").val("");
                uc_main.messagingController.quill.setText('');
            }
        });
    };

    this.submitEmailMessageHandler = function()
    {
        var subject  =  $("#ucSendMessageEmailSubject").val();
        var message;
        
        if($('#ucEditorTogglebtn').prop('checked')==true){
        	message = uc_main.messagingController.quill.container.firstChild.innerHTML;
        }else
        	message = $("#ucSendMessageCodeEditor").val();  
        
        template = $('#ucSendMessageEmailTemplate').val();  
        
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

        uc_main.messagingController.sendMessageHandler(subject,message,template,"",blockDuplicate,"email");
    };

    /*
     * @desc Populates the body of message with the selected template content
     */
    this.templateChangeHandler = function()
    {
        if($(this).val()=="new" || $(this).val()=="noTemplate")
        {
            $("#ucSendMessageEmailSubject").val("");
            uc_main.messagingController.quill.setText('');
            $("#ucDeleteEmailTemplateBtn").hide();
            $("#ucSendMessageEmailTemplate").removeClass("ucExistTemplate");
        }
        else
        {
            $("#ucSendMessageEmailSubject").val($(this).find("option:selected").text()); 
            uc_main.messagingController.quill.container.firstChild.innerHTML =$(this).find("option:selected").attr("data-templatebody");
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

        if(templateId != "new" && templateId != "noTemplate")
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
          message = uc_main.messagingController.quill.getText(),
	  	  msg = "";

	  if($.trim(subject) == "")
	  {
		  msg = "Subject is required";
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
