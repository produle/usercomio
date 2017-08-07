/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc UserComIO Event tracking code.We add it to usercomlib global object created in usercomio-core.
 *
 */



function trackEvent()
{

	window.usercomlib.trackEvent = function(eventName,properties)
	{
		var thisClass = this;

		if(!eventName || eventName.length == 0)
		{
			console.error("Usercom Error: Event name not provided !");
			return;
		}

		var requestObj = {
				appid : thisClass.appid,
				userdata : thisClass.userData,
				properties:properties,
				eventname:eventName,
				sessionId:thisClass.sessionId,
				visitorId:thisClass.visitorId
		}

		xhr.raw(DEFAULT_CONFIG.api_baseurl+'/VisitorTrackingManager/event', JSON.stringify(requestObj),function(data){
			//Event tracking posted successfully
		})
	}

}
