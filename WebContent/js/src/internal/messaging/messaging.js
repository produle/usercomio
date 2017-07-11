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
        
        $("#ucEditorTogglebtn").on("change",thisClass.editorToggleHandler);
        

		thisClass.rivetFieldListObj = rivets.bind(
            document.querySelector('#ucEmailFieldList'), {
                fieldList: []
            }
        ); 	
		var materialCodes = [ "#F44336", "#FF5722", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", "#795548", "#9E9E9E",  "#607D8B", "#FFFFFF", "#000000", "#212121",  "#424242", "#616161", "#757575", "#9E9E9E", "#BDBDBD",  "#E0E0E0", "#EEEEEE", "#F5F5F5", "#FAFAFA"];
		 	
		var toolbarOptions = [
		                      ['bold', 'italic', 'underline','image'],        // toggled buttons
		                      ['link'],      
		                      [{ 'color': materialCodes}, { 'background': materialCodes }],     // dropdown with defaults from theme
		                      [{ 'font': [] },{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown],  
		                      ];  
		
		thisClass.quill = new Quill('#ucSendMessageEmailBody', {
			theme: 'snow',
			modules: {
				toolbar: toolbarOptions
			},
		});
		
 		var toolbar = thisClass.quill.getModule('toolbar');
     	toolbar.addHandler('image', thisClass.imagelinkHandler); 
	};
	
	this.imagelinkHandler = function()
	{
		 var range = this.quill.getSelection();
		 var value = prompt('Paste the image URL');
		 if(value != null)
		 this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER);
		
	};
	 
    this.openSendMessageModal = function()
    {
        $("#ucSendMessageModal").modal();

        $('#ucEmailTemplateDeleteAjaxLoader,#ucBrowserNotificationTemplateDeleteAjaxLoader').hide();
        $("#ucSendMessageEmailSubmit").button('reset');
        $("#ucSendMessageBrowserNotificationSubmit").button('reset');

        $("#ucDeleteEmailTemplateBtn, #ucDeleteBrowserNotificationTemplateBtn").hide();

        $("#ucSendMessageEmailTemplate, #ucSendMessageBrowserNotificationTemplate").removeClass("ucExistTemplate");

        $(".ucSendMessageContainer").hide();
        $("#ucSendMessageEmailContainer").show();

        $("#ucSendMessageTypeTabGroup button").removeClass("active");
        $("#ucSendMessageTypeTabGroup button[data-tabgroup-tabid=ucSendMessageEmailContainer]").addClass("active");
        
        thisClass.quill.setText("");
        $('#ucSendMessageCodeEditor').val('');

        thisClass.emailMessagingController.initSendTypeSettings();

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
    this.sendMessageHandler = function(subject,message,template,link,blockDuplicate,messageType,sendType,scheduleDatetime)
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

        $("#ucSendMessageEmailSubmit").button('loading');
        $("#ucSendMessageEmailSubmit").next(".dropdown-toggle").attr("disabled",true);
        $("#ucSendMessageBrowserNotificationSubmit").button('loading');

        UC_AJAX.call('MessagingManager/sendmessage',{appid:uc_main.appController.currentAppId,user:UC_UserSession.user,filterId:filterId,exclusionList:exclusionList,inclusionList:inclusionList,subject:subject,message:message,template:template,link:link,blockDuplicate:blockDuplicate,messageType:messageType,sendType:sendType,scheduleDatetime:scheduleDatetime},function(data,status,xhr){

                if(data.status == "failure")
                {
                    alert("Could not send messages, kindly check the "+messageType+" Settings");
                }
                else if(data.status == "authenticationfailed")
                {
                    location.href="/";
                }
                else
                {
                    $("#ucSendMessageModal").modal("hide");
                }

                $("#ucSendMessageEmailSubmit").button('reset');
                $("#ucSendMessageEmailSubmit").next(".dropdown-toggle").attr("disabled",false);
                $("#ucSendMessageBrowserNotificationSubmit").button('reset');
            });
    };
    

    /*
     * @desc Handles showing the Quil Editor / Code Editor in message diaglog
     */
    
    this.editorToggleHandler = function()
    {
    	
  	    $('#ucSendMessageEmailBodyWrapper,#ucSendMessageCodeEditor').hide();
    	
    	if($(this).prop('checked') == true)
    	{ 
    		var ans = confirm("Switching to Editor will modify the HTML layout. Click OK to proceed"); 
			if(ans)
			{
				thisClass.quill.setText("");
	    		thisClass.quill.clipboard.dangerouslyPasteHTML($('#ucSendMessageCodeEditor').val());
	    		$('#ucSendMessageEmailBodyWrapper').show(); 
			}
			else
			{
				$(this).prop('checked',false);  
				$('#ucSendMessageCodeEditor').show();    	
			}
    	}	
    	else 
    	{ 
    		$('#ucSendMessageCodeEditor').show().val(uc_main.messagingController.quill.container.firstChild.innerHTML.replace("<p><br></p>", ""));  
    	}
    		
    } 
}
