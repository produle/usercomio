/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the visitor list related operations
 *
 */

function UC_VisitorListController()
{
	var thisClass = this;

	this.visitors = [];

    this.visitorListPageLimit = 30;

    this.visitorListSkipIndex = 0;

    this.visitorListLoaded = false;

    this.rivetVisitorListObj = null;

    this.rivetVisitorDetailsObj = null;

    this.rivetVisitorMessagesObj = null;

    this.currentFilterId = "dashboard";

    this.currentSortColumn = "visitorMetaInfo.lastSeen";

    this.currentSortOrder = 1; //1 for ASC and -1 for DESC

    this.currentFilterTotalVisitors = 0;

	this.constructor = function()
	{
        if(uc_main.appController.renderVisitors)
        {
            $(window).scroll(function() {
               if($(window).scrollTop() + $(window).height() == $(document).height()) {
                   if(!thisClass.visitorListLoaded)
                   {
                       thisClass.getAllVisitors();
                   }
               }
            });

            $(document).on("click",".ucUserListSortableColumn",thisClass.sortUserList);

            $(document).on("click",".ucVisitorPageTrigger",thisClass.openVisitorProfile);

            $("#uc_visitor_list .ucUserListSortableColumn .fa-caret-up").hide();
            $("#uc_visitor_list .ucUserListSortableColumn .fa-caret-down").hide();

            $(document).on("click","#uc-all-user-select",thisClass.userListSelectHandler);

            $(document).on("change","#uc-all-user-select,.uc-user-select",thisClass.updateRecipientCount);
        }
	};

    /*
     * @desc Init all Binding reference objects for rivets
     */
	this.initRivetBinds = function()
	{
		thisClass.rivetVisitorListObj = rivets.bind(
            document.querySelector('#uc_visitor_list'), {
                list: thisClass.visitors
            }
        );

        rivets.binders.visitorid = function (el, value) {
            $(el).attr("id","uc-user-select-"+value._id);
            $(el).attr("data-visitorid",value._id);
            $(el).next("label").attr("for","uc-user-select-"+value._id);
        };

        rivets.binders.latestbrowser = function (el, value) {

            var browserName = value[0].agentInfo.browser;
            var browserVersion = value[0].agentInfo.version;
            var broswerVersionArr = browserVersion.split(".");
            if(broswerVersionArr.length > 2)
            {
                browserVersion = broswerVersionArr[0]+"."+broswerVersionArr[1];
            }

            $(el).html(browserName+" <span>(v"+browserVersion+")</span>");
            $(el).removeClass("chrome safari firefox edge ie");
            $(el).addClass(browserName.toLowerCase());
        };

        rivets.binders.latestplatform = function (el, value) {

            var platformName = value[0].agentInfo.os;
            var platformIcon = "windows";

            if(platformName.toLowerCase().substr(0,5) == "macos")
            {
                platformIcon = "ios";
            }

            //TODO Check for linux

            $(el).html(platformName);
            $(el).removeClass("ios android windows linux");
            $(el).addClass(platformIcon);
        };

        rivets.binders.sessioncount = function (el, value) {

            $(el).html(value.length);
        };
	};

	/*
	 * @desc Gets all visitor information from server
	 */
	this.getAllVisitors = function()
	{

        if(uc_main.appController.currentAppId)
        {
            var filterId = thisClass.currentFilterId;
            if(filterId == 'dashboard')
            {
                filterId = '1';
            }

            UC_AJAX.call('VisitorListManager/visitorlist',{appid:uc_main.appController.currentAppId,skipindex:thisClass.visitorListSkipIndex,pagelimit:thisClass.visitorListPageLimit,filterid:filterId,sortColumn:thisClass.currentSortColumn,sortOrder:thisClass.currentSortOrder},function(data,status,xhr){

                if(data.status == "failure")
                {
                    alert("An Error accured while fetching visitors list !");
                }
                else
                {
                    if(data.totalcount.length == 1)
                    {
                        thisClass.currentFilterTotalVisitors = data.totalcount[0].count;
                    }
                    else
                    {
                        thisClass.currentFilterTotalVisitors = 0;
                    }
                    thisClass.visitors = thisClass.visitors.concat(data.status);
                    thisClass.visitorListSkipIndex = thisClass.visitorListSkipIndex + data.status.length;

                    if(data.status.length == 0)
                    {
                        thisClass.visitorListLoaded = true;
                    }

                    thisClass.listVisitors();
                }
            });
        }
	};

	/*
	 * @desc List visitor entries to UI
	 */
	this.listVisitors = function()
	{

        thisClass.rivetVisitorListObj.models.list = thisClass.visitors;

        thisClass.selectCurrentSort();

	};

    /*
     * @desc Sort the user list
     */
    this.sortUserList = function()
    {
        var newSortColumn = $(this).attr("data-sortColumn");

        if(newSortColumn == thisClass.currentSortColumn)
        {
            if(thisClass.currentSortOrder === 1)
            {
                thisClass.currentSortOrder = -1;
            }
            else
            {
                thisClass.currentSortOrder = 1;
            }
        }
        else
        {
            thisClass.currentSortColumn = newSortColumn;
            thisClass.currentSortOrder = -1;
        }

        if(!UC_UserSession.user.hasOwnProperty('app'))
        {
            UC_UserSession.user.app = {};
        }
        if(!UC_UserSession.user.app.hasOwnProperty(uc_main.appController.currentAppId))
        {
            UC_UserSession.user.app[uc_main.appController.currentAppId] = {};
        }
        if(!UC_UserSession.user.app[uc_main.appController.currentAppId].hasOwnProperty('filterOrder'))
        {
            UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder = {};
        }
        if(!UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder.hasOwnProperty(thisClass.currentFilterId))
        {
            UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder[thisClass.currentFilterId] = {currentSortColumn:"visitorMetaInfo.lastSeen",currentSortOrder:1};
        }
        UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder[thisClass.currentFilterId].currentSortColumn = thisClass.currentSortColumn;
        UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder[thisClass.currentFilterId].currentSortOrder = thisClass.currentSortOrder;

        uc_main.filterController.saveAppPreference();

        thisClass.resetPagination();
        thisClass.getAllVisitors();
    };

    /*
     * @desc Resets the pagination variables so each filter can have fresh start
     */
    this.resetPagination = function()
    {

        thisClass.visitors = [];

        thisClass.visitorListSkipIndex = 0;

        thisClass.visitorListLoaded = false;

        $("#uc-all-user-select").prop("checked",false);
    };

    /*
     * @desc Opens the visitor profile page based on id
     */
    this.openVisitorProfile = function()
    {
        location.href="/visitor/"+$(this).attr("data-visitorid");
    };

    /*
     * @desc Selects the current sorting column to differentiate in ui
     */
    this.selectCurrentSort = function()
    {
        $("#uc_visitor_list .ucUserListSortableColumn .fa-caret-up").hide();
        $("#uc_visitor_list .ucUserListSortableColumn .fa-caret-down").hide();

        if(thisClass.currentSortOrder === 1)
        {
            $("#uc_visitor_list .ucUserListSortableColumn[data-sortColumn='"+thisClass.currentSortColumn+"'] .fa-caret-up").show();
        }
        else
        {
            $("#uc_visitor_list .ucUserListSortableColumn[data-sortColumn='"+thisClass.currentSortColumn+"'] .fa-caret-down").show();
        }
    };

    /*
     * @desc Selects / Unselects the user list based on the select all checkbox
     */
    this.userListSelectHandler = function()
    {
        if($("#uc-all-user-select").is(":checked"))
        {
            $(".uc-user-select").prop("checked",true);
            $("#ucSendMessageGroupBtn").text("Send Message to All");
            $("#ucSendMessageSubmit").text("Send to All");
        }
        else
        {
            $(".uc-user-select").prop("checked",false);
            $("#ucSendMessageGroupBtn").text("Send Message");
            $("#ucSendMessageSubmit").text("Send");
        }
    };

    /*
     * @desc Updates the recipient count
     */
    this.updateRecipientCount = function()
    {
        var recipientCount = 0;
        if($("#uc-all-user-select").is(":checked"))
        {
            recipientCount = thisClass.currentFilterTotalVisitors;

            $(".uc-user-select").each(function(){
                if(!$(this).is(":checked"))
                {
                    recipientCount--;
                }
            });
        }
        else
        {
            $(".uc-user-select").each(function(){
                if($(this).is(":checked"))
                {
                    recipientCount++;
                }
            });
        }

        $("#ucSendMessageGroupBtn,#ucSendMessageSubmit").text("Send Message to "+recipientCount+" users");
    };

    /*
     * @desc Obtains the visitors details
     */
    this.getVisitorDetails = function(visitorId)
    {
        if(visitorId != null)
        {
            UC_AJAX.call('VisitorListManager/getvisitordetails',{appid:uc_main.appController.currentAppId,visitorId:visitorId},function(data,status,xhr){

                if(data.status == "failure")
                {
                    alert("An Error accured while fetching user details !");
                }
                else
                {
                    if(data.visitor != null)
                    {

                        var visitorObj = data.visitor;

                        visitorObj.displayId = (visitorObj._id.substring(0,10))+"...";
                        visitorObj.displaySessionCount = visitorObj.sessions.length;
                        visitorObj.displayLastSeen = moment(visitorObj.visitorMetaInfo.lastSeen).format("DD MMM YYYY HH:mm:ss");
                        visitorObj.displayFirstSeen = moment(visitorObj.visitorMetaInfo.firstSeen).format("DD MMM YYYY HH:mm:ss");

                        thisClass.rivetVisitorDetailsObj = rivets.bind(
                            document.querySelector('#ucVisitorDetail'), {
                                visitor: visitorObj
                            }
                        );
                    }
                }
            });

            UC_AJAX.call('VisitorListManager/getvisitormessages',{appid:uc_main.appController.currentAppId,visitorId:visitorId},function(data,status,xhr){

                if(data.status == "failure")
                {
                    alert("An Error accured while fetching user details !");
                }
                else
                {
                    if(data.messages != null)
                    {

                        var messageList = data.messages;

                        for(var i = 0; i < messageList.length; i++)
                        {
                            messageList[i].displayDate = moment(messageList[i].sentOn).format("DD MMM YYYY HH:mm:ss");
                        }

                        thisClass.rivetVisitorMessagesObj = rivets.bind(
                            document.querySelector('#ucVisitorMessages'), {
                                messageList: messageList
                            }
                        );
                    }
                }
            });
        }
    };
}
