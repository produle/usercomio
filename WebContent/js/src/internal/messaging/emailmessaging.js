/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the email message related operations
 *
 */

function UC_EmailMessagingController()
{
	var thisClass = this;

	this.constructor = function()
	{
		$(document).on("click","#ucSendMessageGroupBtn",thisClass.openSendMessageModal);

        $(document).on("click","#ucSendMessageSubmit",thisClass.submitMessageHandler);

        $(document).on("click",".ucSendMessageSingleTrigger",thisClass.selectCurrentVisitor);
	};

    this.openSendMessageModal = function()
    {
        $("#ucSendMessageModal").modal();
    };

    this.submitMessageHandler = function()
    {
        var filterId = null;
        var exclusionList = [];
        var inclusionList = [];

        var subject = $("#ucSendMessageSubject").val();
        var message = $("#ucSendMessageBody").val();

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

        UC_AJAX.call('EmailManager/sendmessage',{appid:uc_main.appController.currentAppId,user:UC_UserSession.user,filterId:filterId,exclusionList:exclusionList,inclusionList:inclusionList,subject:subject,message:message},function(data,status,xhr){

                if(data.status == "failure")
                {
                    alert("Could not send emails, kindly check the SMTP settings");
                }
                else
                {
                    $("#ucSendMessageModal").modal("hide");
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

        $(this).closest("tr").find(".uc-user-select").prop("checked",true);

        thisClass.openSendMessageModal();
    }
}
