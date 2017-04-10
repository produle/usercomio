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

    /*
     * @desc Draws the line chart for new users based on the data
     */
    this.drawNewUsersGraph = function()
    {
        if(uc_main.appController.currentAppId)
        {

            var noOfDays = 30;

            UC_AJAX.call('DashboardManager/newusers',{appid:uc_main.appController.currentAppId,days:noOfDays},function(data,status,xhr){

                if(data.status == "failure")
                {
                    alert("An Error accured while fetching visitors list !");
                }
                else
                {

                    var responseObjArray = data.status;

                    var chartDataDate = [];
                    var chartDataVisitors = [];

                    var date30DaysBefore = new Date((new Date())-(1000*60*60*24*noOfDays));

                    var tempDate = date30DaysBefore;

                    for(var i = 0; i < 30; i++)
                    {
                        tempDate = new Date(tempDate.getTime()+(1000*60*60*24));

                        var month = (tempDate.getMonth()+1)+"";
                        month = month.length == 1 ? "0"+month : month;

                        var day = tempDate.getDate()+"";
                        day = day.length == 1 ? "0"+day : day;

                        chartDataDate[i] = day+"-"+month;
                        chartDataVisitors[i] = 0;

                        for(var j = 0; j < responseObjArray.length; j++)
                        {
                            if(responseObjArray[j].date == day+"-"+month)
                            {
                                chartDataVisitors[i] = responseObjArray[j].visitors;
                                break;
                            }
                        }
                    }

                    var data = {
                        labels: chartDataDate,
                        datasets: [
                            {
                                label: "New Users",
                                fill: false,
                                lineTension: 0.1,
                                backgroundColor: "rgba(75,192,192,0.4)",
                                borderColor: "rgba(75,192,192,1)",
                                borderCapStyle: 'round',
                                borderDash: [],
                                borderDashOffset: 0.0,
                                borderJoinStyle: 'miter',
                                pointBorderColor: "rgba(75,192,192,1)",
                                pointBackgroundColor: "#fff",
                                pointBorderWidth: 1,
                                pointHoverRadius: 5,
                                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                                pointHoverBorderColor: "rgba(220,220,220,1)",
                                pointHoverBorderWidth: 2,
                                pointRadius: 4,
                                pointHitRadius: 10,
                                data: chartDataVisitors,
                                spanGaps: false,
                            }
                        ]
                    };

                    var myLineChart = new Chart($("#ucNewUsersGraph"), {
                        type: 'line',
                        data: data
                    });
                }
            });
        }

    };
}
