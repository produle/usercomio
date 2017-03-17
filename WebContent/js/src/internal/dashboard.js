/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the dashboard related operations
 *
 */

function UC_DashboardController()
{
	var thisClass = this;

	this.visitors = [];

    this.visitorListPageLimit = 30;

    this.visitorListSkipIndex = 0;

    this.visitorListLoaded = false;

    this.rivetVisitorListObj = null;

    this.metrics = {};

    this.currentFilterId = "1"; //TODO Add predefined filters in setup

	this.constructor = function()
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

        $(document).on("click",".uc_table_header .fa-caret-up",thisClass.sortUserList);
	};

	/*
	 * @desc Gets all visitor information from server
	 */
	this.getAllVisitors = function()
	{

        if(uc_main.appController.currentAppId)
        {
            UC_AJAX.call('DashboardManager/visitorlist',{appid:uc_main.appController.currentAppId,skipindex:thisClass.visitorListSkipIndex,pagelimit:thisClass.visitorListPageLimit,filterid:thisClass.currentFilterId},function(data,status,xhr){

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
                    thisClass.listMetrics();
                }
            });
        }
	};

	/*
	 * @desc Gets all dashboard metrics information from server
	 */
	this.getDashboardMetrics = function()
	{

        if(uc_main.appController.currentAppId)
        {

            UC_AJAX.call('DashboardManager/metrics',{appid:uc_main.appController.currentAppId},function(data,status,xhr){

                if(data.status == "failure")
                {
                    alert("An Error accured while fetching visitors list !");
                }
                else
                {
                    thisClass.metrics = data.metrics;
                    thisClass.listMetrics();
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
	 * @desc List metrics to the dashboard
	 */
	this.listMetrics = function()
	{

        rivets.binders.faiconclass = function (el, value) {
            el.className = 'fa fa-' + value.toLowerCase();
        };

		rivets.bind(
            document.querySelector('#uc_tab_data_dashboard'), {
                currentUsers: 10,
                totalUsers: thisClass.metrics.totalUsers,
                slippingAway: thisClass.metrics.slippingAway,
                topBrowser: "Chrome",
                newUsers: thisClass.metrics.newUsers,
                openIssues: 10
            }
        );

	};

    /*
     * @desc Sort the user list
     */
    this.sortUserList = function()
    {

    };

    /*
     * @desc Resets the pagination variables so each filter can have fresh start
     */
    this.resetPagination = function()
    {

        thisClass.visitors = [];

        thisClass.visitorListSkipIndex = 0;

        thisClass.visitorListLoaded = false;
    }
}
