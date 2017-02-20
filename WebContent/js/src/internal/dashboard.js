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

	this.constructor = function()
	{

	};

	/*
	 * @desc Gets all visitor information from server
	 */
	this.getAllVisitors = function()
	{

        if(mainController.appController.currentAppId)
        {

            UC_AJAX.call('DashboardManager/visitorlist',{appid:mainController.appController.currentAppId},function(data,status,xhr){

                if(data.status == "failure")
                {
                    alert("An Error accured while fetching visitors list !");
                }
                else
                {
                    if(data.status.length > 0)
                    {
                        thisClass.visitors = data.status;
                        thisClass.listVisitors();
                        thisClass.listMetrics();
                    }
                }
            });
        }
	};

	/*
	 * @desc List visitor entries to UI
	 */
	this.listVisitors = function()
	{
        var list = {visitorList:thisClass.visitors};

        rivets.bind(
            document.querySelector('#uc_visitor_list'), {
                list: list
            }
        );

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
