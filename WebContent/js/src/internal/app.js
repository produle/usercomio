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

    this.renderVisitors = false;
	
	this.constructor = function()
	{
		this.bindUIEvents();

        thisClass.initRivetBinds();

        $(document).on("click","#uc_app_list li",function(){
            var appid = $(this).attr("data-appid");
            for(var iter = 0; iter < thisClass.apps.length; iter++)
            {
                if(appid == thisClass.apps[iter].id)
                {
                    thisClass.switchApp(thisClass.apps[iter]);
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
			$('#uc_newapp_creation_modal').modal('show')
		});
		
		$('#uc_create_newapp_submitbtn').on('click',function(){
			thisClass.createNewApp();
		});
		
		$('#ucupdate_app_submitbtn').on('click',function(e){
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
			else
			{
				if(data.status.length > 0)
				{
					thisClass.apps = data.status;
					thisClass.listApps(thisClass.apps);

                    thisClass.switchApp(thisClass.apps[0]);
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
			newApp.id = UC_Utils.guidGenerator();
			newApp.clientid = user.company;
			
			UC_AJAX.call('AppManager/createNewApp',{newApp:newApp},function(data,status,xhr){
				
				if(data.status == "appexists")
				 {
					 alert("App with this name already exists !");
				 }
				 else if(data.status == "failure")
				 {
					 alert("An Error accured while saving data !");
				 }
				 else 
				 {
					 thisClass.apps.push(data.status);
					 thisClass.listApps([data.status]);
					 $('#uc_newapp_creation_modal').modal('hide');

                     thisClass.switchApp(thisClass.apps[0]);
				 }
				
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

        rivets.bind(
            document.querySelector('#uc_app_list'), {
                list: list
            }
        );

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
		});
		
		$('.ucapp_deletebtncls').on('click',function(e){
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
		
		var appIndex = UC_Utils.searchObjArray(thisClass.apps,'id',appid);
		
		if(appIndex != -1)
		{
			var app = thisClass.apps[appIndex];
			app.name = editedAppName;
			
			UC_AJAX.call('AppManager/updateAnAppDetails',{app:app},function(data,status,xhr){
				
				if(data.status == "appexists")
				 {
					 alert("App with this name already exists !");
				 }
				 else if(data.status == "failure")
				 {
					 alert("An Error accured while saving data !");
				 }
				 else 
				 {
					 thisClass.updateAppDetailsInAppsListing(app);
                     if(thisClass.currentAppId == app.id)
                     {
                         thisClass.rivetAppNameObj.models.currentAppName = app.name;
                     }

					 $('#ucapp_update_modal').modal('hide');
				 }
			});
		}
		
		
	}
	
	/*
	 * @desc Delete an app
	 */
	this.deleteAnApp = function(appid)
	{
		
			var appIndex = UC_Utils.searchObjArray(thisClass.apps,'id',appid);
			
			var app = thisClass.apps[appIndex];
			
			var ans = confirm("Do you want to delete "+app.name+" ?")
			
			if(ans)
			{
				if(app)
				{
					
					
					UC_AJAX.call('AppManager/deleteAnApp',{app:app},function(data,status,xhr){
						
						 if(data.status == "failure")
						 {
							 alert("An Error accured while deleting the app entry !");
						 }
						 else 
						 {
							 thisClass.apps.splice(appIndex, 1);
							 thisClass.deleteAnAppEntryFromListing(app.id);
						 }
					});
				}
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
			$('#app_'+app.id).find('.ucapp_namecls').html(app.name);
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
			var appIndex = UC_Utils.searchObjArray(thisClass.apps,'id',appid);
			
			if(appIndex != -1)
			{
				var app = thisClass.apps[appIndex];
				
				$('#ucapp_update_nameinput').val(app.name);
				$('#ucapp_update_appid').val(app.id);
				$('#ucapp_update_appid_display').text(app.id);
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
    this.switchApp = function(app)
    {
        thisClass.currentAppId = app.id;
        thisClass.rivetAppNameObj.models.currentAppName = app.name;

        if(UC_UserSession.user.hasOwnProperty('app') && UC_UserSession.user.app.hasOwnProperty(thisClass.currentAppId) && UC_UserSession.user.app[thisClass.currentAppId].hasOwnProperty('currentFilter'))
        {
            uc_main.visitorListController.currentFilterId = UC_UserSession.user.app[thisClass.currentAppId].currentFilter;
        }

        if(UC_UserSession.user.hasOwnProperty('app') && UC_UserSession.user.app.hasOwnProperty(thisClass.currentAppId) && UC_UserSession.user.app[thisClass.currentAppId].hasOwnProperty('currentSortColumn'))
        {
            uc_main.visitorListController.currentSortColumn = UC_UserSession.user.app[thisClass.currentAppId].currentSortColumn;
            uc_main.visitorListController.currentSortOrder = UC_UserSession.user.app[thisClass.currentAppId].currentSortOrder;
        }

        if(thisClass.renderVisitors)
        {
            uc_main.visitorListController.resetPagination();
            uc_main.visitorListController.getAllVisitors();
            uc_main.dashboardController.getDashboardMetrics();
            uc_main.dashboardController.drawNewUsersGraph();
            uc_main.filterController.listUserdefinedFilters();
        }
    };
}
