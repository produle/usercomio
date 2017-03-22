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

    this.currentFilterId = "1"; //TODO Add predefined filters in setup

    this.currentSortColumn = "visitormetainfo.lastseen";

    this.currentSortOrder = 1; //1 for ASC and -1 for DESC

	this.constructor = function()
	{
        if(uc_main.appController.renderVisitors)
        {
            thisClass.rivetVisitorListObj = rivets.bind(
                document.querySelector('#uc_visitor_list'), {
                    list: thisClass.visitors
                }
            );

            rivets.binders.visitorid = function (el, value) {
                $(el).attr("id","uc-user-select-"+value._id);
                $(el).next("label").attr("for","uc-user-select-"+value._id);
            };

            rivets.binders.latestbrowser = function (el, value) {

                var browserName = value[0].agentinfo.browser;
                var browserVersion = value[0].agentinfo.version;
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

                var platformName = value[0].agentinfo.os;
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

            $(window).scroll(function() {
               if($(window).scrollTop() + $(window).height() == $(document).height()) {
                   if(!thisClass.visitorListLoaded)
                   {
                       thisClass.getAllVisitors();
                   }
               }
            });

            $(document).on("click",".ucUserListSortableColumn",thisClass.sortUserList);

            $(document).on("click",".ucUserBaseDetails",thisClass.openVisitorProfile);

            $("#uc_visitor_list .ucUserListSortableColumn .fa-caret-up").hide();
            $("#uc_visitor_list .ucUserListSortableColumn .fa-caret-down").hide();
        }
	};

	/*
	 * @desc Gets all visitor information from server
	 */
	this.getAllVisitors = function()
	{

        if(uc_main.appController.currentAppId)
        {
            UC_AJAX.call('VisitorListManager/visitorlist',{appid:uc_main.appController.currentAppId,skipindex:thisClass.visitorListSkipIndex,pagelimit:thisClass.visitorListPageLimit,filterid:thisClass.currentFilterId,sortColumn:thisClass.currentSortColumn,sortOrder:thisClass.currentSortOrder},function(data,status,xhr){

                if(data.status == "failure")
                {
                    alert("An Error accured while fetching visitors list !");
                }
                else
                {
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

        $("#uc_visitor_list .ucUserListSortableColumn .fa-caret-up").hide();
        $("#uc_visitor_list .ucUserListSortableColumn .fa-caret-down").hide();

        if(thisClass.currentSortOrder === 1)
        {
            $(this).find(".fa-caret-up").show();
        }
        else
        {
            $(this).find(".fa-caret-down").show();
        }

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
    };

    /*
     * @desc Opens the visitor profile page based on id
     */
    this.openVisitorProfile = function()
    {
        location.href="/visitor/"+$(this).attr("data-visitorid");
    };
}
