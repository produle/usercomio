/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the app related curd operations
 *
 */

function UC_AppController()
{
	var thisClass = this;
	
	this.apps = [];

    this.currentAppId = null;

    this.rivetAppNameObj = null;

    this.rivetAppListObj = null;

    this.renderVisitors = false;
	
	this.constructor = function()
	{
		this.bindUIEvents();

        thisClass.initRivetBinds();

        $(document).on("click","#uc_app_list li",function(){
            var appid = $(this).attr("data-appid");
            for(var iter = 0; iter < thisClass.apps.length; iter++)
            {
                if(appid == thisClass.apps[iter]._id)
                {
                    thisClass.switchApp(thisClass.apps[iter],false);
                    break;
                }
            }

        });
	};

    /*
     * @desc Init all Binding reference objects for rivets
     */
	this.initRivetBinds = function()
	{
		thisClass.rivetAppNameObj = rivets.bind(
            document.querySelector('#uc_currentapp_name'), {
                currentAppName: thisClass.currentAppId
            }
        );
	};
	
	this.bindUIEvents = function()
	{
		$(document).on('click','#uc_create_newapp_modalopen_btn',function(){
			$('#uc_newapp_creation_modal').modal('show');
			$("#uc_create_newapp_submitbtn").button('reset');
		});
		
		$('#uc_create_newapp_submitbtn').on('click',function(e){
            e.preventDefault();
			thisClass.createNewApp();
		});
		
		$('#ucupdate_app_submitbtn').on('click',function(e){
			e.preventDefault();
			e.stopImmediatePropagation();
			thisClass.updateAppDetails();
		})
		
		thisClass.getAllUserApps();
	}
	
	/*
	 * @desc Gets all apps information from server
	 */
	this.getAllUserApps = function()
	{
		UC_AJAX.call('AppManager/getAllUserApps',{user:UC_UserSession.user},function(data,status,xhr){
			
			if(data.status == "failure")
			 {
				 alert("An Error accured while fetching user's app !");
			 }
            else if(data.status == "authenticationfailed")
            {
                location.href="/";
            }
			else
			{
				if(data.status.length > 0)
				{
					thisClass.apps = data.status;
					thisClass.listApps(thisClass.apps);

                    thisClass.switchApp(thisClass.apps[0],true);
				}
			}
		});
	}
	
	/*
	 * @desc Creates a new app
	 */
	this.createNewApp = function()
	{
		var appName = $('#uc_create_newapp_nameinput').val();
		
		var validationResult = thisClass.validateAppInputDetails();
		
		if(validationResult == "")
		{
			var newApp = new UC_App();
			var user = UC_UserSession.user;
			
			newApp.name = appName;
			newApp.creator = user.username;
			newApp._id = UC_Utils.guidGenerator();
			newApp.clientId = user.company;
			
            $("#uc_create_newapp_submitbtn").button('loading');

			UC_AJAX.call('AppManager/createNewApp',{newApp:newApp,user:user},function(data,status,xhr){
				
				if(data.status == "appexists")
				 {
					 alert("App with this name already exists !");
				 }
				 else if(data.status == "failure")
				 {
					 alert("An Error accured while saving data !");
				 }
                 else if(data.status == "authenticationfailed")
                 {
                     location.href="/";
                 }
				 else 
				 {
					 thisClass.apps.push(data.status);
					 thisClass.listApps(thisClass.apps);
					 $('#uc_newapp_creation_modal').modal('hide');

                     thisClass.switchApp(thisClass.apps[0],false);
				 }

                $("#uc_create_newapp_submitbtn").button('reset');
				
			});
			
		}
		else
		{
			alert(validationResult);
		}
	}
	
	/*
	 * @desc Add an app entry to UI
	 */
	this.listApps = function(apps)
	{
        var list = {appList:apps};

        if(thisClass.rivetAppListObj == null)
        {
            thisClass.rivetAppListObj = rivets.bind(
                document.querySelector('#uc_app_list'), {
                    list: list
                }
            );
        }
        else
        {
            thisClass.rivetAppListObj.models.list = list;
        }

        thisClass.bindAppDetailModificationOperationEvents();
		
	}
	
	/*
	 * @desc binds edit and delete operation of apps
	 */
	this.bindAppDetailModificationOperationEvents = function()
	{
		$('.ucapp_editbtncls').on('click',function(e){
			e.stopImmediatePropagation();
			$('#ucapp_update_modal').modal('show');
			var appid = $(this).attr('data-appid');
			thisClass.fillAppInformationInUpdateModal(appid);
            $("#ucupdate_app_submitbtn").button('reset');
		});
		
		$('#ucDeleteAppBtn').on('click',function(e){
			e.stopImmediatePropagation();
			var appid = $(this).attr('data-appid');
			thisClass.deleteAnApp(appid);
		});
	}
	
	/*
	 * @desc Updates app details
	 */
	this.updateAppDetails = function()
	{
		var appid = $('#ucapp_update_appid').val();
		var editedAppName = $('#ucapp_update_nameinput').val();
		
		var appIndex = UC_Utils.searchObjArray(thisClass.apps,'_id',appid);
		
		if(appIndex != -1)
		{
			var app = thisClass.apps[appIndex];
			app.name = editedAppName;
			
            $("#ucupdate_app_submitbtn").button('loading');

			UC_AJAX.call('AppManager/updateAnAppDetails',{app:app},function(data,status,xhr){
				
				if(data.status == "appexists")
				 {
					 alert("App with this name already exists !");
				 }
				 else if(data.status == "failure")
				 {
					 alert("An Error accured while saving data !");
				 }
                 else if(data.status == "authenticationfailed")
                 {
                     location.href="/";
                 }
				 else 
				 {
					 thisClass.updateAppDetailsInAppsListing(app);
                     if(thisClass.currentAppId == app._id)
                     {
                         thisClass.rivetAppNameObj.models.currentAppName = app.name;
                     }

					 $('#ucapp_update_modal').modal('hide');
				 }

                $("#ucupdate_app_submitbtn").button('reset');
			});
		}
		
		
	}
	
	/*
	 * @desc Delete an app
	 */
	this.deleteAnApp = function(appid)
	{
		
        if(thisClass.apps.length > 1)
        {
			var appIndex = UC_Utils.searchObjArray(thisClass.apps,'_id',appid);
			
			var app = thisClass.apps[appIndex];
			
			var ans = confirm("Do you want to delete "+app.name+" and all its contents?")
			
			if(ans)
			{
				if(app)
				{
					
					
					UC_AJAX.call('AppManager/deleteAnApp',{app:app},function(data,status,xhr){
						
						 if(data.status == "failure")
						 {
							 alert("An Error accured while deleting the app entry !");
						 }
                         else if(data.status == "authenticationfailed")
                         {
                             location.href="/";
                         }
						 else if(data.status == "defaultapp")
						 {
							 alert("There should be a minimum of one app.");
						 }
						 else 
						 {
                             $('#ucapp_update_modal').modal('hide');

							 thisClass.apps.splice(appIndex, 1);

                             thisClass.listApps(thisClass.apps);
                             thisClass.switchApp(thisClass.apps[0],false);
						 }
					});
				}
			}
		
        }
        else
        {
            alert("There should be a minimum of one app.");
        }
		
	}
	
	/*
	 * @desc Deletes an app entry from app details listed UI
	 */
	this.deleteAnAppEntryFromListing = function(appid)
	{
		if(appid)
		{
			$('#app_'+appid).remove();
			
		}
	}
	
	/*
	 * @desc Updates UI with app details
	 * @param app: app with udpate details
	 */
	this.updateAppDetailsInAppsListing = function(app)
	{
		if(app)
		{
			$('#app_'+app._id).find('.ucapp_namecls').html(app.name);
		}
	}
	
	/*
	 * @desc Fills update modal input values
	 * @param app : App whose information is to updated.
	 */
	this.fillAppInformationInUpdateModal = function(appid)
	{
		if(appid)
		{
			var appIndex = UC_Utils.searchObjArray(thisClass.apps,'_id',appid);
			
			if(appIndex != -1)
			{
				var app = thisClass.apps[appIndex];
				
				$('#ucapp_update_nameinput').val(app.name);
				$('#ucapp_update_appid').val(app._id);
				$('#ucapp_update_appid_display').text(app._id);
				$('#ucDeleteAppBtn').attr("data-appid",app._id);

                var trackingSnippet = '<script type="text/javascript" src="'+uc_main.userController.config.baseURL+'/tracking/track.js?appid='+app._id+'"></script>\n'+
                    '<script>\n'+
                    '\tUsercom.init({\n'+
                        '\t\tname: "John Smith",   /* Fullname of the visitor */\n'+
                        '\t\temail: "jsmith@usercom.io",   /* Email Address of the visitor */\n'+
                        '\t\tcreated_at: new Date().getTime(), /* Current timestamp */\n'+
                        '\t\tpaid: true, /* Boolean */\n'+
                        '\t\tbirthdate: "1990-01-01", /* Date in format YYYY-MM-DD */\n'+
                        '\t\tgender: "male", /* possible values ("male","female","other") */\n'+
                        '\t\tprofilepicture: "", /* a valid profile picture url */\n'+
                    '\t});\n'+
                    '</script>\n';
				$('#ucapp_update_trackingcode').text(trackingSnippet);
			}
		}
	}
	
	/*
	 * @desc Validates user input in create new app modal
	 */
	this.validateAppInputDetails = function()
	{
		var appName = $('#uc_create_newapp_nameinput').val();
		
		var msg = "";
		
		if(appName == '')
	    {
			msg = "Invalid App Name !";
	    }
		
		return msg;
	}
	
	this.add = function()
	{
		err();
	}

    /**
     * @desc Changes the appid and related data
     */
    this.switchApp = function(app,isInit)
    {
        thisClass.currentAppId = app._id;
        thisClass.rivetAppNameObj.models.currentAppName = app.name;

        if(UC_UserSession.user.hasOwnProperty('app') && UC_UserSession.user.app.hasOwnProperty(thisClass.currentAppId) && UC_UserSession.user.app[thisClass.currentAppId].hasOwnProperty('currentFilter'))
        {
            uc_main.visitorListController.currentFilterId = UC_UserSession.user.app[thisClass.currentAppId].currentFilter;
        }

        if(UC_UserSession.user.hasOwnProperty('app') && UC_UserSession.user.app.hasOwnProperty(thisClass.currentAppId) && UC_UserSession.user.app[thisClass.currentAppId].hasOwnProperty('filterOrder') && UC_UserSession.user.app[thisClass.currentAppId].filterOrder.hasOwnProperty(uc_main.visitorListController.currentFilterId) && UC_UserSession.user.app[thisClass.currentAppId].filterOrder[uc_main.visitorListController.currentFilterId].hasOwnProperty('currentSortColumn'))
        {
            uc_main.visitorListController.currentSortColumn = UC_UserSession.user.app[thisClass.currentAppId].filterOrder[uc_main.visitorListController.currentFilterId].currentSortColumn;
            uc_main.visitorListController.currentSortOrder = UC_UserSession.user.app[thisClass.currentAppId].filterOrder[uc_main.visitorListController.currentFilterId].currentSortOrder;
        }

        if(UC_UserSession.user.hasOwnProperty('app') && UC_UserSession.user.app.hasOwnProperty(thisClass.currentAppId) && UC_UserSession.user.app[thisClass.currentAppId].hasOwnProperty('filterOrder') && UC_UserSession.user.app[thisClass.currentAppId].filterOrder.hasOwnProperty(uc_main.visitorListController.currentFilterId) && UC_UserSession.user.app[thisClass.currentAppId].filterOrder[uc_main.visitorListController.currentFilterId].hasOwnProperty('displayFields'))
        {
            uc_main.visitorListController.displayFields = UC_UserSession.user.app[thisClass.currentAppId].filterOrder[uc_main.visitorListController.currentFilterId].displayFields;
        }

        if(thisClass.renderVisitors)
        {
            uc_main.dashboardController.getDashboardMetrics();
            uc_main.dashboardController.drawNewUsersGraph();
            uc_main.filterController.listUserdefinedFilters();
            uc_main.visitorListController.getFieldsList();
        }
        
        else if(!isInit)
        {
            location.href="/";
        }

        
        //update it websocket client list
        if(uc_main.rtcController.socket)
        {
        	 var msg = {};
     		msg.name = "establishappconnection";
     		msg.key =  thisClass.currentAppId;
     		msg  = JSON.stringify(msg);
     		uc_main.rtcController.sendMessageToServer(msg);
        }
       

    };
}
