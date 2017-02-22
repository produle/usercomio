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

    this.visitorListPageLimit = 10;

    this.visitorListSkipIndex = 0;

    this.visitorListLoaded = false;

    this.rivetVisitorListObj = null;

	this.constructor = function()
	{
        thisClass.rivetVisitorListObj = rivets.bind(
            document.querySelector('#uc_visitor_list'), {
                list: thisClass.visitors
            }
        );

        $(window).scroll(function() {
           if($(window).scrollTop() + $(window).height() == $(document).height()) {
               if(!thisClass.visitorListLoaded)
               {
                   thisClass.getAllVisitors();
               }
           }
        });
	};

	/*
	 * @desc Gets all visitor information from server
	 */
	this.getAllVisitors = function()
	{

        if(uc_main.appController.currentAppId)
        {

            UC_AJAX.call('DashboardManager/visitorlist',{appid:uc_main.appController.currentAppId,skipindex:thisClass.visitorListSkipIndex,pagelimit:thisClass.visitorListPageLimit},function(data,status,xhr){

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

        var newUsers = 0;
        var slippingAway = 0;

        //Total Users
        var totalUsers = thisClass.visitors.length;

        for(var iter = 0; iter < thisClass.visitors.length; iter++)
        {
            if(new Date(thisClass.visitors[iter].visitormetainfo.lastseen).getTime() < (new Date().getTime()-(30 * 24 * 60 * 60 * 1000)))
            {
                //Slipping Away
                slippingAway++;
            }
            else if(thisClass.visitors[iter].visitormetainfo.firstseen == thisClass.visitors[iter].visitormetainfo.lastseen)
            {
                //New Users
                newUsers++;
            }
        }


        //Current Users

        //Top Browser

        //Open Issues

        rivets.binders.faiconclass = function (el, value) {
            el.className = 'fa fa-' + value.toLowerCase();
        };

		rivets.bind(
            document.querySelector('#uc_tab_data_dashboard'), {
                currentUsers: 10,
                totalUsers: totalUsers,
                slippingAway: slippingAway,
                topBrowser: "Chrome",
                newUsers: newUsers,
                openIssues: 10
            }
        );

	};
}
