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
	
	this.activities = []; 
	
	this.visitorId = null;
	 
    this.visitorListPageLimit = 30;

    this.visitorListSkipIndex = 0;

    this.visitorListLoaded = false;

    this.rivetVisitorListObj = null;

    this.rivetVisitorDetailsObj = null;

    this.rivetVisitorMessagesObj = null;
    
    this.rivetVisitorSessionsObj = null;
    
    this.rivetVisitorPlaceholderObj = null;

    this.activityListSkipIndex = 0;
    
    this.activityListPageLimit = 30;
    
    this.activityListloaded = false;

    this.rivetVisitorColumnListObj = null;

    this.currentFilterId = "dashboard";

    this.currentSortColumn = "visitorMetaInfo.lastSeen";

    this.currentSortOrder = -1; //1 for ASC and -1 for DESC

    this.currentFilterTotalVisitors = 0;
    
    this.newVisitors = 0;

    this.displayFields = [];

    this.visitorListInProcess = false;

    this.constructor = function()
	{
        if(uc_main.appController.renderVisitors)
        {
        	$('.ucTableWrapper').scroll(function() {
               if( ($('.ucTableWrapper').offset().top - $('#uc_visitor_list').offset().top) == ($('#uc_visitor_list').height() - $('.ucTableWrapper').height()) + 1 ) {
                   if(!thisClass.visitorListLoaded)
                   {
                       thisClass.getAllVisitors();
                   } 
               }
            });

            $(document).on("click",".ucUserListSortableColumn",thisClass.sortUserList);

            $(document).on("click",".ucVisitorPageTrigger",thisClass.openVisitorProfile);

            $(document).on("click","#ucVisitorPageBackBtn",thisClass.closeVisitorProfile);

            $("#uc_visitor_list .ucUserListSortableColumn .fa-caret-up").hide();
            $("#uc_visitor_list .ucUserListSortableColumn .fa-caret-down").hide();

            $(document).on("click","#uc-all-user-select",thisClass.userListSelectHandler);

            $(document).on("change","#uc-all-user-select,.uc-user-select",thisClass.updateRecipientCount);

            $("#ucVisitorFieldsPopover").popover({
                html: true,
                content: function() {
                    return thisClass.getOrderedFieldsForPopover();
                }
            });

            $('#ucVisitorFieldsPopover').on('shown.bs.popover', function () {
                $(".ucVisitorFieldList").sortable();
            })

            $("#ucVisitorFieldsPopover").on('shown.bs.popover', function () {
                for(var i = 0; i < thisClass.displayFields.length; i++)
                {
                    $(".ucVisitorFieldList").find('[data-fieldid="'+thisClass.displayFields[i]+'"]').prop("checked",true);
                };

            })

            $(document).on("click","#ucVisitorFieldsPopoverSubmit",thisClass.saveFieldsListHandler);

            $(document).on("click","#ucVisitorSearchBtn",thisClass.searchHandler);
        };
	};

    /*
     * @desc Init all Binding reference objects for rivets
     */
	this.initRivetBinds = function()
	{
		thisClass.rivetVisitorListObj = rivets.bind(
            document.querySelector('#uc_visitor_list'), {
                list: thisClass.visitors,
                fieldList: []
            }
        );
		 

        rivets.binders.visitorid = function (el, value) {
            $(el).attr("id","uc-user-select-"+value._id);
            $(el).attr("data-visitorid",value._id);
            $(el).next("label").attr("for","uc-user-select-"+value._id);
        };

        rivets.binders.latestbrowser = function (el, value) {

            var browserName = value[0].agentInfo.browser;
            var browserVersion = value[0].agentInfo.version;
            var broswerVersionArr = browserVersion.split(".");
            if(broswerVersionArr.length > 2)
            {
                browserVersion = broswerVersionArr[0]+"."+broswerVersionArr[1];
            }

            var browserIcon = "chrome"; //TODO Change default icon

            if(value[0].agentInfo.rawAgentData.isChrome)
            {
                browserIcon = "chrome";
            }

            if(value[0].agentInfo.rawAgentData.isSafari)
            {
                browserIcon = "safari";
            }

            if(value[0].agentInfo.rawAgentData.isFirefox)
            {
                browserIcon = "firefox";
            }

            if(value[0].agentInfo.rawAgentData.isEdge)
            {
                browserIcon = "edge";
            }

            if(value[0].agentInfo.rawAgentData.isIE)
            {
                browserIcon = "ie";
            }

            $(el).html(browserName+" <span>(v"+browserVersion+")</span>");
            $(el).removeClass("chrome safari firefox edge ie");
            $(el).addClass(browserIcon); 
        };

        rivets.binders.latestplatform = function (el, value) {

            var platformName = value[0].agentInfo.os;
            var platformIcon = "windows"; //TODO Change default icon

            if(value[0].agentInfo.rawAgentData.isWindows)
            {
                platformIcon = "windows";
            }

            if(value[0].agentInfo.rawAgentData.isMac || value[0].agentInfo.rawAgentData.isiPad || value[0].agentInfo.rawAgentData.isiPod || value[0].agentInfo.rawAgentData.isiPhone)
            {
                platformIcon = "ios";
            }

            if(value[0].agentInfo.rawAgentData.isLinux || value[0].agentInfo.rawAgentData.isLinux64)
            {
                platformIcon = "linux";
            }

            if(value[0].agentInfo.rawAgentData.isAndroid)
            {
                platformIcon = "android";
            }

            $(el).html(platformName);
            $(el).removeClass("ios android windows linux");
            $(el).addClass(platformIcon);
        };

        rivets.binders.sessioncount = function (el, value) {

            $(el).html(value.length);
        };

        rivets.binders.profilepicture = function (el, value) {
            if(value.profilepicture != null && value.profilepicture != "")
            {
                $(el).find(".ucUserProfileImage").attr("src",value.profilepicture).show();
                $(el).find(".ucUserProfileIntial").hide();
            }
            else
            {
                var sColor = UC_Utils.getProfileColor(value.name);

                $(el).find(".ucUserProfileIntial").css({"background-color": sColor}).text(value.name[0]).show();
                $(el).find(".ucUserProfileImage").hide();
            }
        };

        thisClass.rivetVisitorColumnListObj = rivets.bind(
            document.querySelector('#ucVisitorFieldList'), {
                fieldList: []
            }
        );

        rivets.binders.customfieldheader = function (el, value) {
            $(el).addClass("ucVisitorListToggleField_"+value.value);
            $(el).attr("data-sortColumn","visitorData."+value.value);
            $(el).find(".ucVisitorListHeaderLabel").html(value.label);
        };

        rivets.binders.customfielddata = function (el, value) {
            $(el).addClass("ucVisitorListToggleField_"+value.value);
            $(el).attr("data-customField",value.value);
            $(el).html("{visitor.visitorData.name}");
            $(el).find(".ucVisitorListHeaderLabel").html(value.label);
        };

        rivets.binders.customfieldtest = function (el, value) {

            var displayData = value[$(el).attr("data-customField")]

            if($(el).attr("data-customField") == "created_at")
            {
                displayData = moment(displayData).format("Do MMM YY, HH:mm");
            }

            $(el).text(displayData);
        };

        rivets.binders.country = function (el, value) {
            
        	if(value[0].geoLocationInfo.country !="") {
        		$(el).html( "<span data-toggle='tooltip' data-placement='left'  class='mfTooltip flag "+ value[0].geoLocationInfo.country.toLowerCase()+"' data-original-title='"+value[0].geoLocationInfo.countryName+"'></span>" ); 
        	}
        	else {
        		$(el).html('');
        	}
            
        };

        rivets.binders.lastseen = function (el, value) {
            $(el).html(moment(value).format("Do MMM YY, HH:mm"));
        };

        rivets.binders.firstseen = function (el, value) {
            $(el).html(moment(value).format("Do MMM YY, HH:mm"));
        };

		thisClass.rivetVisitorPlaceholderObj = rivets.bind(
            document.querySelector('#ucVisitorListPlaceholder'), {
                display: false
            }
        );

        thisClass.rivetVisitorMessagesObj = rivets.bind(
            document.querySelector('#ucVisitorMessages'), {
                messageList: []
            }
        );

	    thisClass.rivetVisitorSessionsObj = rivets.bind(
	       document.querySelector("#ucVisitorActivity"), {
	           ActivityList: [],
	       }
	    );
	};

	/*
	 * @desc Gets all visitor information from server
	 */
	this.getAllVisitors = function(mongoFilterQuery)
	{

        if(typeof mongoFilterQuery == "undefined")
        {
            mongoFilterQuery = null;
        }

        if(uc_main.appController.currentAppId && !thisClass.visitorListInProcess)
        {
            thisClass.visitorListInProcess = true;

            var filterId = thisClass.currentFilterId;
            if(filterId == 'dashboard')
            {
                filterId = '1';
            }

            $("#ucVisitorListAjaxLoader").show();

            UC_AJAX.call('VisitorListManager/visitorlist',{appid:uc_main.appController.currentAppId,skipindex:thisClass.visitorListSkipIndex,pagelimit:thisClass.visitorListPageLimit,filterid:filterId,sortColumn:thisClass.currentSortColumn,sortOrder:thisClass.currentSortOrder,mongoFilterQuery:mongoFilterQuery},function(data,status,xhr){

                if(data.status == "failure")
                {
                    alert("An Error accured while fetching visitors list !");
                }
                else if(data.status == "authenticationfailed")
                {
                    location.href="/";
                }
                else
                {
                    if(data.totalcount.length == 1)
                    {
                        thisClass.currentFilterTotalVisitors = data.totalcount[0].count;
                    }
                    else
                    {
                        thisClass.currentFilterTotalVisitors = 0;
                    }
                    thisClass.visitors = thisClass.visitors.concat(data.status);
                    thisClass.visitorListSkipIndex = thisClass.visitorListSkipIndex + data.status.length;

                    if(thisClass.visitors.length >= thisClass.currentFilterTotalVisitors)
                    {
                        thisClass.visitorListLoaded = true;
                    }

                    thisClass.listVisitors(data.status);

                    $("#ucPredefinedFilterList").find("li[data-filterid="+filterId+"] .ucFilterListVisitorCount").text(thisClass.currentFilterTotalVisitors);
                    $("#ucUserdefinedFilterList").find("li[data-filterid="+filterId+"] .ucFilterListVisitorCount").text(thisClass.currentFilterTotalVisitors);
                }

                thisClass.updateRecipientCount();
                $("#ucVisitorListAjaxLoader").hide();
                $("#ucPageLoader").hide();

                thisClass.visitorListInProcess = false;
            });
        }
	};

	/*
	 * @desc List visitor entries to UI
	 */
	this.listVisitors = function(newVisitors)
	{

		for(var i=0;i< thisClass.visitors.length;i++)
		{
			thisClass.visitors[i].isVisitorOnline = false;
			thisClass.visitors[i].isVisitorOffline = true;
		} 
		thisClass.rivetVisitorListObj.models.list = thisClass.rivetVisitorListObj.models.list.concat(newVisitors);
        
        thisClass.checkVisitorPresence(thisClass.visitors);
        
        thisClass.selectCurrentSort();

        //thisClass.reorderFieldsInUserlist();  //TODO Has issues in switch app, need to be fixed

        thisClass.toggleVisitorListFields();

        if(thisClass.currentFilterId == "1" && thisClass.visitors.length == 0)
        {
            thisClass.rivetVisitorPlaceholderObj.models.display = true;
        }
        else
        {
            thisClass.rivetVisitorPlaceholderObj.models.display = false;
        } 
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

        if(!UC_UserSession.user.hasOwnProperty('app'))
        {
            UC_UserSession.user.app = {};
        }
        if(!UC_UserSession.user.app.hasOwnProperty(uc_main.appController.currentAppId))
        {
            UC_UserSession.user.app[uc_main.appController.currentAppId] = {};
        }
        if(!UC_UserSession.user.app[uc_main.appController.currentAppId].hasOwnProperty('filterOrder'))
        {
            UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder = {};
        }
        if(!UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder.hasOwnProperty(thisClass.currentFilterId))
        {
            UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder[thisClass.currentFilterId] = {currentSortColumn:"visitorMetaInfo.lastSeen",currentSortOrder:1,displayFields:[]};
        }
        UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder[thisClass.currentFilterId].currentSortColumn = thisClass.currentSortColumn;
        UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder[thisClass.currentFilterId].currentSortOrder = thisClass.currentSortOrder;

        uc_main.filterController.saveAppPreference();

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

        $("#uc-all-user-select").prop("checked",false);

        thisClass.rivetVisitorPlaceholderObj.models.display = false;
        
        thisClass.rivetVisitorListObj.models.list = [];
    };

    /*
     * @desc Opens the visitor profile page based on id
     */
    this.openVisitorProfile = function()
    {
        thisClass.getVisitorDetails($(this).attr("data-visitorid"));
        $(".ucVisitorPageWrapper").show();
        $(".ucIndexPageWrapper").hide();
        history.pushState("", document.title, window.location.pathname + window.location.search + "visitor/" + $(this).attr("data-visitorid"));
    };

    /*
     * @desc Closes the visitor profile page and opens the list
     */
    this.closeVisitorProfile = function()
    {
        $(".ucIndexPageWrapper").show();
        $(".ucVisitorPageWrapper").hide();
        history.pushState("", document.title, "/");
    };

    /*
     * @desc Selects the current sorting column to differentiate in ui
     */
    this.selectCurrentSort = function()
    {
        $("#uc_visitor_list .ucUserListSortableColumn .fa-caret-up").hide();
        $("#uc_visitor_list .ucUserListSortableColumn .fa-caret-down").hide();

        if(thisClass.currentSortOrder === 1)
        {
            $("#uc_visitor_list .ucUserListSortableColumn[data-sortColumn='"+thisClass.currentSortColumn+"'] .fa-caret-up").show();
        }
        else
        {
            $("#uc_visitor_list .ucUserListSortableColumn[data-sortColumn='"+thisClass.currentSortColumn+"'] .fa-caret-down").show();
        }
    };

    /*
     * @desc Selects / Unselects the user list based on the select all checkbox
     */
    this.userListSelectHandler = function()
    {
        if($("#uc-all-user-select").is(":checked"))
        {
            $(".uc-user-select").prop("checked",true);
            $("#ucSendMessageGroupBtn").text("Send Message to All");
            $("#ucSendMessageEmailSubmit,#ucSendMessageBrowserNotificationSubmit").text("Send to All");
        }
        else
        {
            $(".uc-user-select").prop("checked",false);
            $("#ucSendMessageGroupBtn").text("Send Message");
            $("#ucSendMessageEmailSubmit,#ucSendMessageBrowserNotificationSubmit").text("Send");
        }
    };

    /*
     * @desc Updates the recipient count
     */
    this.updateRecipientCount = function()
    {
        var recipientCount = 0; 
       
        if($("#uc-all-user-select").is(":checked"))
        {
            recipientCount = thisClass.currentFilterTotalVisitors;

            $(".uc-user-select").each(function(){
                if(!$(this).is(":checked"))
                {
                    recipientCount--;
                }
            });
        }
        else
        {
            $(".uc-user-select").each(function(){
                if($(this).is(":checked"))
                {
                    recipientCount++;
                }
            });
        }
        
        if(recipientCount != 0)
        {
            $('#ucSendMessageGroupBtn').prop("disabled", false);
        }
        else
        	 $('#ucSendMessageGroupBtn').prop("disabled", true);

        $("#ucSendMessageGroupBtn,#ucSendMessageEmailSubmit,#ucSendMessageBrowserNotificationSubmit").text("Send to "+recipientCount+" users");
    };

    /*
     * @desc Obtains the visitors details
     */
    this.getVisitorDetails = function(visitorId)
    {
        if(visitorId != null)
        {
        	thisClass.visitorId = visitorId;
        	
            $("#ucVisitorDetailAjaxLoader").show();

            UC_AJAX.call('VisitorListManager/getvisitordetails',{appid:uc_main.appController.currentAppId,visitorId:visitorId},function(data,status,xhr){

                if(data.status == "failure")
                {
                    alert("An Error accured while fetching user details !");
                }
                else if(data.status == "authenticationfailed" || data.status == "notfound")
                {
                    location.href="/";
                }
                else
                {
                    if(data.visitor != null)
                    {

                        var visitorObj = data.visitor;

                        visitorObj.displayId = (visitorObj._id.substring(0,10))+"...";
                        visitorObj.displaySessionCount = visitorObj.sessions.length;
                        visitorObj.displayLastSeen = moment(visitorObj.visitorMetaInfo.lastSeen).format("DD MMM YYYY HH:mm:ss");
                        visitorObj.displayFirstSeen = moment(visitorObj.visitorMetaInfo.firstSeen).format("DD MMM YYYY HH:mm:ss");
                       

                        thisClass.rivetVisitorDetailsObj = rivets.bind(
                            document.querySelector('#ucVisitorDetail'), {
                                visitor: visitorObj
                            }
                        );
                    }

                    $("#ucVisitorDetailAjaxLoader").hide();
                    $("#ucVisitorDetailTable").show();
                }
            });


            $("#ucVisitorMessageAjaxLoader").show();

            UC_AJAX.call('VisitorListManager/getvisitormessages',{appid:uc_main.appController.currentAppId,visitorId:visitorId},function(data,status,xhr){

                if(data.status == "failure")
                {
                    alert("An Error accured while fetching user details !");
                }
                else if(data.status == "authenticationfailed")
                {
                    location.href="/";
                }
                else
                {
                    if(data.messages != null)
                    {

                        var messageList = data.messages;

                        for(var i = 0; i < messageList.length; i++)
                        {
                            messageList[i].displayDate = moment(messageList[i].sentOn).format("DD MMM YYYY HH:mm:ss");
                        }

                        thisClass.rivetVisitorMessagesObj.models.messageList = messageList;
                    }

                    $("#ucVisitorMessageAjaxLoader").hide();
                    $("#ucVisitorMessages").show();
                }
            }); 
        }
        

        
        $(window).scroll(function() {
            if($(window).scrollTop() + $(window).height() == $(document).height()) { 
                
                if(!thisClass.activityListloaded)
                {
                    thisClass.getVisitorActivity(thisClass.visitorId);
                }
            }
         });

        thisClass.resetActivities();

        thisClass.getVisitorActivity(visitorId);
    };
    
    /*
     * @desc Obtains the activity list like sessions,events etc.,
     */ 
    
    this.getVisitorActivity = function(visitorId)
    { 
        $("#ucVisitorActivity").hide();
        $("#ucVisitorActivityAjaxLoader").show();
        UC_AJAX.call('VisitorListManager/getvisitorsessions',{visitorId:visitorId,skipindex:thisClass.activityListSkipIndex,pagelimit:thisClass.activityListPageLimit},function(data,status,xhr){
        	
        	   if(data.status == "failure")
               {
                   alert("An Error accured while fetching user details !");
               }
               else if(data.status == "authenticationfailed")
               {
                   location.href="/";
               }
               else
               {
                   if(data.sessions != null)
                   {
                	  var ActivityList = data.sessions;
                	  
                	  if(ActivityList.length == 0)
                      {
                          thisClass.activityListloaded = true;
                      }
                	  
                	  thisClass.activityListSkipIndex = thisClass.activityListSkipIndex + ActivityList.length;
                	  
                	  for(var i = 0; i < ActivityList.length; i++)
                      {
                		  ActivityList[i].sessions = ActivityList[i].sessions[0];
                		  ActivityList[i].sessions.agentInfo.sessionStart = moment(ActivityList[i].sessions.agentInfo.sessionStart).format("DD MMM YYYY HH:mm:ss");
                		  if(ActivityList[i].eventName == "Logged In")
                		  {
                			  ActivityList[i].eventType =   ActivityList[i].sessions.agentInfo.device + "-" + ActivityList[i].sessions.agentInfo.platform +"-"+  ActivityList[i].sessions.agentInfo.os  +"-"+  ActivityList[i].sessions.agentInfo.browser  +"-"+  ActivityList[i].sessions.agentInfo.version;
                		  }
                		  else
                		  {
                			  ActivityList[i].eventType = JSON.stringify(ActivityList[i].eventProperties);
                		  }
                		 
                      }
                	  
                	  thisClass.activities = thisClass.activities.concat(ActivityList); 
                	  
                	  thisClass.rivetVisitorSessionsObj.models.ActivityList = thisClass.activities ;
                	  
                   } 
                   $("#ucVisitorActivityAjaxLoader").hide(); 
                   $("#ucVisitorActivity").show();
               } 
        });
    	
    };

    /*
     * @desc Reset activity list when a fresh visitor is selected
     */
    this.resetActivities = function()
    {
        thisClass.activities = [];

        thisClass.rivetVisitorSessionsObj.models.ActivityList = thisClass.activities;

        thisClass.activityListSkipIndex = 0;

        thisClass.activityListloaded = false;
    }
    
    /*
     * @desc Obtains the list of fields for the app
     */
    this.getFieldsList = function()
    {
        UC_AJAX.call('VisitorListManager/getfieldslist',{appid:uc_main.appController.currentAppId,user:UC_UserSession.user},function(data,status,xhr){

            if(data.status == "failure")
            {
                alert("Error while getting field list");
            }
            else if(data.status == "authenticationfailed")
            {
                location.href="/";
            }
            else
            {
                var fieldList = [];

                for(var iter = 0; iter < data.fields.length; iter++)
                {
                    if(data.fields[iter] != "name")
                    {
                        var fieldItem = {};
                        fieldItem.value = data.fields[iter];
                        fieldItem.label = data.fields[iter];
                        fieldItem.label = fieldItem.label.replace("_"," ");
                        fieldItem.label = fieldItem.label.charAt(0).toUpperCase() + fieldItem.label.slice(1);
                        fieldList.push(fieldItem);
                    }
                }

                var fieldListDropdown = [
                    {value:"browser",label:"Browser"},
                    {value:"os",label:"Operating System"},
                    {value:"device",label:"Device"},
                    {value:"country",label:"Country"},
                    {value:"lastseen",label:"Last Seen"},
                    {value:"firstseen",label:"First Seen"}
                ];

                thisClass.rivetVisitorColumnListObj.models.fieldList = fieldListDropdown.concat(fieldList);
                thisClass.rivetVisitorListObj.models.fieldList = fieldList;
                thisClass.resetPagination();
                thisClass.getAllVisitors();
            }
        });
    };

    /*
     * @desc Saves the fields preference for each filter
     */
    this.saveFieldsListHandler = function()
    {
        thisClass.displayFields = [];

        var fieldsOrder = [];

        $(".ucVisitorFieldList").find("li").each(function(){

            fieldsOrder.push($(this).find(".ucVisitorFieldListItem").attr("data-fieldid"));

            if($(this).find(".ucVisitorFieldListItem").is(":checked"))
            {
                thisClass.displayFields.push($(this).find(".ucVisitorFieldListItem").attr("data-fieldid"));
            }
        });

        $("#ucVisitorFieldsPopover").popover('hide');

        if(!UC_UserSession.user.hasOwnProperty('app'))
        {
            UC_UserSession.user.app = {};
        }
        if(!UC_UserSession.user.app.hasOwnProperty(uc_main.appController.currentAppId))
        {
            UC_UserSession.user.app[uc_main.appController.currentAppId] = {};
        }
        if(!UC_UserSession.user.app[uc_main.appController.currentAppId].hasOwnProperty('filterOrder'))
        {
            UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder = {};
        }
        if(!UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder.hasOwnProperty(thisClass.currentFilterId))
        {
            UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder[thisClass.currentFilterId] = {currentSortColumn:"visitorMetaInfo.lastSeen",currentSortOrder:1,displayFields:[]};
        }
        UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder[thisClass.currentFilterId].displayFields = thisClass.displayFields;
        UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder[thisClass.currentFilterId].fieldsOrder = fieldsOrder;

        uc_main.filterController.saveAppPreference();

        thisClass.reorderFieldsInUserlist();

        thisClass.toggleVisitorListFields(); 
    };

    /*
     * @desc List the corresponding fields in visitorlist as per selection
     */
    this.toggleVisitorListFields = function()
    {
        $(".ucVisitorListToggleField").hide();

        for(var i = 0; i < thisClass.displayFields.length; i++)
        {
            $(".ucVisitorListToggleField_"+thisClass.displayFields[i]).show();
        };
        
        $('.mfTooltip').tooltip(); 
    };

    /*
     * @desc Orders the fields in popover based on the user preference
     */
    this.getOrderedFieldsForPopover = function()
    {
        var popoverHTML = $('#ucVisitorFieldsPopoverContent').clone();

        if(UC_UserSession.user.hasOwnProperty('app') && UC_UserSession.user.app.hasOwnProperty(uc_main.appController.currentAppId) && UC_UserSession.user.app[uc_main.appController.currentAppId].hasOwnProperty('filterOrder') && UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder.hasOwnProperty(thisClass.currentFilterId) && UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder[thisClass.currentFilterId].hasOwnProperty('fieldsOrder'))
        {
            var fieldsOrder = UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder[thisClass.currentFilterId].fieldsOrder;

            var tmpOrderedHTML = "";

            for(var i = 0; i < fieldsOrder.length; i++)
            {
                if($(popoverHTML).find("li[data-fieldid='"+fieldsOrder[i]+"']").length > 0)
                {
                    tmpOrderedHTML += $(popoverHTML).find("li[data-fieldid='"+fieldsOrder[i]+"']").prop('outerHTML') ;
                    $(popoverHTML).find("li[data-fieldid='"+fieldsOrder[i]+"']").remove();
                }
            }

            $(popoverHTML).find("#ucVisitorFieldList").prepend(tmpOrderedHTML);
        }

        $(popoverHTML).find("#ucVisitorFieldList").removeAttr("id").addClass("ucVisitorFieldList");
        return $(popoverHTML).html();
    };

    /*
     * @desc Orders the fields in userlist based on the user preference
     */
    this.reorderFieldsInUserlist = function()
    {
        var fieldsOrder = [];

        if(UC_UserSession.user.hasOwnProperty('app') && UC_UserSession.user.app.hasOwnProperty(uc_main.appController.currentAppId) && UC_UserSession.user.app[uc_main.appController.currentAppId].hasOwnProperty('filterOrder') && UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder.hasOwnProperty(thisClass.currentFilterId) && UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder[thisClass.currentFilterId].hasOwnProperty('fieldsOrder'))
        {
            fieldsOrder = UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder[thisClass.currentFilterId].fieldsOrder;

        }
        else
        {
            $("#ucVisitorFieldList").find("li").each(function(){
                fieldsOrder.push($(this).find(".ucVisitorFieldListItem").attr("data-fieldid"));
            });
        }

        $(".ucTableRow").each(function(){

            var previousElement = ".ucVisitorListSession";

            for(var i = 0; i < fieldsOrder.length; i++)
            {
                var tmpElement = $(this).find(".ucVisitorListToggleField_"+fieldsOrder[i]).clone();
                $(this).find(".ucVisitorListToggleField_"+fieldsOrder[i]).remove();

                $(tmpElement).insertAfter($(this).find(previousElement));

                previousElement = ".ucVisitorListToggleField_"+fieldsOrder[i];

            }


        });
    };

    /*
     * @desc Handles the search process, frames the query and calls the visitor list (similar to draaft filter)
     */
    this.searchHandler = function(e)
    {
        e.preventDefault();

        var searchField = $("#ucVisitorSearchField").val();

        var searchValue = $("#ucVisitorSearchValue").val();

        var mongoFilter = '{ "$and": [ { "'+searchField+'": { "$regex": "'+searchValue+'" } } ] }';

        thisClass.resetPagination();
        thisClass.getAllVisitors(mongoFilter);
    };
    
    /*
     * @desc Handles new visitor arrived after user has logged into usercomio dashboard
     * @param newVisitorObj : visitor object
     */
    this.newVisitorAction = function(newVisitorObj)
    {
    	thisClass.newVisitors = thisClass.newVisitors + 1;
    	
    	$('.ucNewVisitorNotificationMsgCls').remove();
    	$('.ucSearchBar').after("<p style='padding-left: 15px;font-size: 11px;color: #2b9af3;cursor:pointer' class='ucNewVisitorNotificationMsgCls'>"+thisClass.newVisitors+" user(s) have arrived since you have logged in.Click to refresh the visitor's list.</p>");
    	
    	$('.ucNewVisitorNotificationMsgCls').on('click',function(){
    		thisClass.resetPagination();
            thisClass.getAllVisitors();
    		$(this).remove();
    	});
    }
    
    this.checkVisitorPresence = function(visitors)
    {
    	var visitorsToCheck = [];
    	
    	for(var i=0;i<visitors.length;i++)
    	{
    		var visitor = visitors[i].visitorData.email+"-"+uc_main.appController.currentAppId;
    		
    		visitorsToCheck.push(visitor);
    	}
    	
    	var msg = {};
    	msg.name = "userpresence";
    	msg.visitors = visitorsToCheck;
    	
    	uc_main.rtcController.sendMessageToServer(JSON.stringify(msg));
    }
}
