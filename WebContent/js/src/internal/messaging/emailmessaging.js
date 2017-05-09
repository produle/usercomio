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

    this.rivetFieldListObj = null;

    this.emailTemplateList = [];

	this.constructor = function()
	{
		$(document).on("click","#ucSendMessageGroupBtn",thisClass.openSendMessageModal);

        $(document).on("click","#ucSendMessageSubmit",thisClass.submitMessageHandler);

        $(document).on("click",".ucSendMessageSingleTrigger",thisClass.selectCurrentVisitor);

        $(document).on("change","#ucSendMessageTemplate",thisClass.templateChangeHandler);

        $(document).on("click","#ucDeleteTemplateBtn",thisClass.deleteTemplateHandler);

		thisClass.rivetEmailTemplateListObj = rivets.bind(
            document.querySelector('#ucSendMessageTemplate'), {
                emailTemplateList: thisClass.emailTemplateList
            }
        );

		thisClass.rivetFieldListObj = rivets.bind(
            document.querySelector('#ucEmailFieldList'), {
                fieldList: []
            }
        );
	};

    this.openSendMessageModal = function()
    {
        $("#ucSendMessageModal").modal();

        $('#ucSendMessageAjaxLoader').hide();

        $("#ucDeleteTemplateBtn").hide();

        UC_AJAX.call('EmailManager/getemailtemplates',{appid:uc_main.appController.currentAppId,user:UC_UserSession.user},function(data,status,xhr){

            if(data.status == "failure")
            {
                alert("Could not send emails, kindly check the SMTP settings");
            }
            else
            {
                thisClass.emailTemplateList = data.emailTemplateList;
                thisClass.rivetEmailTemplateListObj.models.emailTemplateList = thisClass.emailTemplateList;

                $('#ucSendMessageTemplate option:eq(0)').prop('selected', true);
                $("#ucSendMessageSubject,#ucSendMessageBody").val("");
            }
        });

        UC_AJAX.call('VisitorListManager/getfieldslist',{appid:uc_main.appController.currentAppId,user:UC_UserSession.user},function(data,status,xhr){

            if(data.status == "failure")
            {
                alert("Could not send emails, kindly check the SMTP settings");
            }
            else
            {
                for(var iter = 0; iter < data.fields.length; iter++)
                {
                    data.fields[iter] = "{"+data.fields[iter]+"}";
                }
                thisClass.rivetFieldListObj.models.fieldList = data.fields;
            }
        });
    };

    this.submitMessageHandler = function()
    {
        var filterId = null;
        var exclusionList = [];
        var inclusionList = [];

        var subject = $("#ucSendMessageSubject").val();
        var message = $("#ucSendMessageBody").val();
        var template = $("#ucSendMessageTemplate").val();
        var blockDuplicate = false;

        if($("#ucSendMessageBlockDuplicate").is(":checked"))
        {
            blockDuplicate = true;
        }

        if($("#uc-all-user-select").is(":checked"))
        {
            filterId = uc_main.visitorListController.currentFilterId;

            $(".uc-user-select").each(function(){
                if(!$(this).is(":checked"))
                {
                    exclusionList.push($(this).attr("data-visitorid"));
                }
            });
        }
        else
        {
            $(".uc-user-select").each(function(){
                if($(this).is(":checked"))
                {
                    inclusionList.push($(this).attr("data-visitorid"));
                }
            });
        }

        //call the email trigger server function

        $('#ucSendMessageAjaxLoader').show();

        UC_AJAX.call('EmailManager/sendmessage',{appid:uc_main.appController.currentAppId,user:UC_UserSession.user,filterId:filterId,exclusionList:exclusionList,inclusionList:inclusionList,subject:subject,message:message,template:template,blockDuplicate:blockDuplicate},function(data,status,xhr){

                if(data.status == "failure")
                {
                    alert("Could not send emails, kindly check the SMTP settings");
                }
                else
                {
                    $("#ucSendMessageModal").modal("hide");
                }

                $('#ucSendMessageAjaxLoader').hide();
            });
    };

    /*
     * @desc Selects the checkbox of corresponding visitor to insert them in inclusionList
     */
    this.selectCurrentVisitor = function()
    {
        $("#uc-all-user-select").prop("checked",false);
        $(".uc-user-select").prop("checked",false);

        uc_main.visitorListController.userListSelectHandler();

        $(this).closest("tr").find(".uc-user-select").prop("checked",true);

        thisClass.openSendMessageModal();
    }

    /*
     * @desc Populates the bosy of message with the selected template content
     */
    this.templateChangeHandler = function()
    {
        if($(this).val()=="new")
        {
            $("#ucSendMessageSubject,#ucSendMessageBody").val("");
            $("#ucDeleteTemplateBtn").hide();
        }
        else
        {
            $("#ucSendMessageSubject").val($(this).find("option:selected").text());
            $("#ucSendMessageBody").val($(this).find("option:selected").attr("data-templatebody"));
            $("#ucDeleteTemplateBtn").show();
        }
    }

    /*
     * @desc Removes the selected template
     */
    this.deleteTemplateHandler = function()
    {

        var templateId = $("#ucSendMessageTemplate").val();

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
                    else
                    {
                        $("#ucSendMessageModal").modal("hide");
                    }

                    $('#ucSendMessageAjaxLoader').hide();
                });
            }
        }

    }
}
