/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the message related operations
 *
 */

function UC_MessagingController()
{
	var thisClass = this;

    this.emailMessagingController = new UC_EmailMessagingController();

    this.browserNotificationController = new UC_BrowserNotificationController();

    this.rivetFieldListObj = null;
    
    this.quill = null;

	this.constructor = function()
	{

        thisClass.emailMessagingController.constructor();

        thisClass.browserNotificationController.constructor();

        $(document).on("click","#ucSendMessageGroupBtn",thisClass.openSendMessageModal);

        $(document).on("click",".ucSendMessageSingleTrigger",thisClass.selectCurrentVisitor);

		thisClass.rivetFieldListObj = rivets.bind(
            document.querySelector('#ucEmailFieldList'), {
                fieldList: []
            }
        );
		
		var toolbarOptions = [{ 'header': [1, 2, 3, 4, 5, 6, false] },'bold', 'italic', 'underline','link', 'image',{ 'list': 'ordered'}, { 'list': 'bullet' }, 'clean'];
		
		var toolbarOptions = [
		                      ['bold', 'italic', 'underline'],        // toggled buttons
		                      ['link','image'],      
		                      [{ 'color': ['#F44336','#E91E63','#F44336','#E91E63','#F44336','#E91E63'] }, { 'background': ['#F44336','#E91E63'] }],          // dropdown with defaults from theme
		                      [{ 'font': [] },{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown],                                         
		                    ];
		
		
		thisClass.quill = new Quill('#ucSendMessageEmailBody', {
			theme: 'snow',
			modules: {
				toolbar: toolbarOptions
			},
		});
	};

    this.openSendMessageModal = function()
    {
        $("#ucSendMessageModal").modal();

        $('#ucSendMessageAjaxLoader').hide();

        $("#ucDeleteEmailTemplateBtn, #ucDeleteBrowserNotificationTemplateBtn").hide();

        $("#ucSendMessageEmailTemplate, #ucSendMessageBrowserNotificationTemplate").removeClass("ucExistTemplate");

        $(".ucSendMessageContainer").hide();
        $("#ucSendMessageEmailContainer").show();

        $("#ucSendMessageTypeTabGroup button").removeClass("active");
        $("#ucSendMessageTypeTabGroup button[data-tabgroup-tabid=ucSendMessageEmailContainer]").addClass("active");
        
        thisClass.quill.setText("");

        thisClass.emailMessagingController.getEmailTemplates();

        thisClass.browserNotificationController.getBrowserNotificationTemplates();

        UC_AJAX.call('VisitorListManager/getfieldslist',{appid:uc_main.appController.currentAppId,user:UC_UserSession.user},function(data,status,xhr){

            if(data.status == "failure")
            {
                alert("Error while getting field list");
            }
            else if(data.status == "authenticationfailed")
            {
                location.href="/";
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

    /*
     * @desc Selects the checkbox of corresponding visitor to insert them in inclusionList
     */
    this.selectCurrentVisitor = function()
    {
        $("#uc-all-user-select").prop("checked",false);
        $(".uc-user-select").prop("checked",false);

        uc_main.visitorListController.userListSelectHandler();

        $(this).closest(".ucTableRow").find(".uc-user-select").prop("checked",true);

        thisClass.openSendMessageModal();
    };

    /*
     * @desc Collects the filterId, inclusionList and exclusionList for send message
     */
    this.sendMessageHandler = function(subject,message,template,link,blockDuplicate,messageType)
    {
        var filterId = null;
        var exclusionList = [];
        var inclusionList = [];

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

        UC_AJAX.call('MessagingManager/sendmessage',{appid:uc_main.appController.currentAppId,user:UC_UserSession.user,filterId:filterId,exclusionList:exclusionList,inclusionList:inclusionList,subject:subject,message:message,template:template,link:link,blockDuplicate:blockDuplicate,messageType:messageType},function(data,status,xhr){

                if(data.status == "failure")
                {
                    alert("Could not send emails, kindly check the Email Settings");
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
    };
}
