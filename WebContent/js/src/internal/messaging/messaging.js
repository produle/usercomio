/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the message related operations
 *
 */

function UC_MessagingController()
{
	var thisClass = this;

    this.emailMessagingController = new UC_EmailMessagingController();

	this.constructor = function()
	{

        thisClass.emailMessagingController.constructor();
	};
}
