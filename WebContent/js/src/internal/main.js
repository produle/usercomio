/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Entry point act as a starting point for application
 *
 */

function UC_MainController()
{
	var thisClass = this;
	
	this.appController = new UC_AppController();
	this.dashboardController = new UC_DashboardController();
	this.userController = new UC_UserController();

    this.rivetUserNameObj = null;
	
	this.constructor = function()
	{

        thisClass.appController.constructor();

        thisClass.rivetUserNameObj = rivets.bind(
            document.querySelector('#uc_currentuser_name'), {
                currentUserName: UC_UserSession.user.firstName+" "+UC_UserSession.user.lastName
            }
        );

        $(".uc_tab_trigger").on("click",thisClass.toggleTabs);

	};

    /**
     * @desc Toggles between tabs. This is a global function, not specific to specific tab group
     */
    this.toggleTabs = function()
    {
        $("."+$(this).attr("data-tabgroup-class")).hide();
        $("#"+$(this).attr("data-tabgroup-tabid")).show();

        $(this).closest(".btn-group").find(".btn").removeClass("active");
        $(this).addClass("active");
    };
}
