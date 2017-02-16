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
	
	this.constructor = function()
	{
		thisClass.appController.constructor();

        rivets.bind(
            document.querySelector('#uc_currentuser_name'), {
                currentUserName: UC_UserSession.user.firstName+" "+UC_UserSession.user.lastName
            }
        );

        rivets.bind(
            document.querySelector('#uc_currentapp_name'), {
                currentAppName: "Select an App";//thisClass.appController.currentAppId
            }
        );
	}
}
