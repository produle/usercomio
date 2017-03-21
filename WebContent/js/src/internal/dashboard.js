/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the dashboard related operations
 *
 */

function UC_DashboardController()
{
	var thisClass = this;

    this.metrics = {};

	this.constructor = function()
	{

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
}
