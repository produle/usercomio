/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the filter related operations
 *
 */

function UC_FilterController()
{
	var thisClass = this;

    this.predefinedFiltersList = [];

    this.userdefinedFiltersList = [];

    this.rivetPredefinedFiltersListObj = null;

    this.rivetUserdefinedFiltersListObj = null;

    this.filterOnEdit = null;

	this.constructor = function()
	{

        if(uc_main.appController.renderVisitors)
        {
            thisClass.listPredefinedFilters();

            $(document).on("click","#ucPredefinedFilterList li span, #ucUserdefinedFilterList li span",thisClass.changeFilterHandler);
            $(document).on("click",".ucAddFilterBtn",thisClass.addFilterHandler);
            $(document).on("click","#ucEditFilterSubmit",thisClass.saveFilterHandler);
            $(document).on("click",".ucFilterSettingBtn .ico-edit",thisClass.editFilterHandler);
            $(document).on("click",".ucFilterSettingBtn .ico-trash2",thisClass.deleteFilterHandler);

            $("#ucUserdefinedFilterList").sortable({
                update: thisClass.updateFilterOrder
            });

            $(document).on("click","#ucMainDashboard",function(){
                thisClass.changeCurrentFilter("dashboard");
            });
        }
	};

    /*
     * @desc Init all Binding reference objects for rivets
     */
	this.initRivetBinds = function()
	{
		thisClass.rivetPredefinedFiltersListObj = rivets.bind(
            document.querySelector('#ucPredefinedFilterList'), {
                list: thisClass.predefinedFiltersList
            }
        );

        thisClass.rivetUserdefinedFiltersListObj = rivets.bind(
            document.querySelector('#ucUserdefinedFilterList'), {
                list: thisClass.userdefinedFiltersList
            }
        );
	};

    /*
     * @desc List pre defined filters
     */
    this.listPredefinedFilters = function()
    {
        UC_AJAX.call('FilterManager/listpredefined',{user:UC_UserSession.user},function(data,status,xhr){

            if(data.status == "failure")
            {
                alert("An Error accured while fetching filters list");
            }
            else
            {
                thisClass.predefinedFiltersList = data.status;
                thisClass.rivetPredefinedFiltersListObj.models.list = thisClass.predefinedFiltersList;
            }
        });
    };

    /*
     * @desc List user defined filters
     */
    this.listUserdefinedFilters = function()
    {
        UC_AJAX.call('FilterManager/listuserdefined',{user:UC_UserSession.user,appid:uc_main.appController.currentAppId},function(data,status,xhr){

            if(data.status == "failure")
            {
                alert("An Error accured while fetching filters list");
            }
            else
            {
                var user = UC_UserSession.user;
                var filterList = data.status;

                //Reorders the filters arrangement based on the user preference
                if(user.hasOwnProperty('app') && user.app.hasOwnProperty(uc_main.appController.currentAppId) && user.app[uc_main.appController.currentAppId].hasOwnProperty('filterOrder'))
                {
                    var filterOrder = user.app[uc_main.appController.currentAppId].filterOrder;
                    var reOrderedFilterList = [];

                    for(var iter = 0; iter < filterOrder.length; iter++)
                    {
                        for(var iterFilter = 0; iterFilter < filterList.length; iterFilter++)
                        {
                            if(filterOrder[iter] == filterList[iterFilter]._id)
                            {
                                reOrderedFilterList.push(filterList[iterFilter]);
                            }

                        }
                    }

                    filterList = reOrderedFilterList;
                }

                thisClass.userdefinedFiltersList = filterList;
                thisClass.rivetUserdefinedFiltersListObj.models.list = thisClass.userdefinedFiltersList;

                if(uc_main.visitorListController.currentFilterId == "dashboard")
                {
                    $(".ucSwitchContentContainer").hide();
                    $("#uc_tab_data_dashboard").show();
                    $(".ucSwitchContentTrigger").removeClass("ucCurrentPage");
                    $("#ucMainDashboard").addClass("ucCurrentPage");
                }
                else
                {
                    $(".ucSwitchContentContainer").hide();
                    $("#uc_tab_data_listuser").show();
                    $(".ucSwitchContentTrigger").removeClass("ucCurrentPage");
                    $("#ucPredefinedFilterList li[data-filterid="+uc_main.visitorListController.currentFilterId+"],#ucUserdefinedFilterList li[data-filterid="+uc_main.visitorListController.currentFilterId+"]").addClass("ucCurrentPage");
                }
            }
        });
    };

    /*
     * @desc Creates the instance of query builder for filter
     */
    this.initQueryBuilder = function(filterRule)
    {

        $('#ucFilterQueryBuilderUI').queryBuilder('destroy');

        $('#ucFilterQueryBuilderUI').queryBuilder({
          plugins: ['bt-tooltip-errors'],

          filters: [{
            id: 'visitorData.name',
            label: 'Name',
            type: 'string'
          }, {
            id: 'visitorMetaInfo.lastSeen',
            label: 'Last Seen',
            type: 'datetime',
            validation: {
              format: 'YYYY-MM-DD HH:mm:ss'
            },
            plugin: 'datetimepicker',
            plugin_config: {
                format:'Y-m-d H:i:s'
            },
            input: 'text',
            operators: ['less_or_equal', 'greater_or_equal', 'between']
          },{
            id: 'sessions.agentInfo.browser',
            label: 'Browser',
            type: 'string'
          }],

          rules: filterRule
        });
    };

    /*
     * @desc Opens the filter edit modal
     */
    this.editFilterHandler = function()
    {
        var filterObj = thisClass.getFilterById($(this).closest("li").attr("data-filterid"));

        thisClass.filterOnEdit = filterObj;

        thisClass.initQueryBuilder(JSON.parse(filterObj.filter));

        $("#ucFilterName").val(filterObj.name);

        $("#ucEditFilterModal").modal();
        
        $('.rule-container .rule-actions .btn-danger').text('');
		$('.rule-container .rule-actions .btn-danger').addClass('ucListingFilterDeleteIcon');
		
        $('#ucFilterQueryBuilderUI').on('afterAddRule.queryBuilder', function(e, rule, error, value) {
        	$('.rule-container .rule-actions .btn-danger').text('');
        	$('.rule-container .rule-actions .btn-danger').addClass('ucListingFilterDeleteIcon');
        });
    };

    /*
     * @desc Obtains a filter from the list based on the id
     * @param filterId - id of the filter to be obtained
     */
    this.getFilterById = function(filterId)
    {
        for(var iter = 0 ; iter < thisClass.userdefinedFiltersList.length; iter++)
        {
            var item = thisClass.userdefinedFiltersList[iter];
            if(item._id == filterId)
            {
                return item;
            }
        }

        return false;
    };

    /*
     * @desc Opens the Add Filter modal
     */
    this.addFilterHandler = function()
    {
        thisClass.filterOnEdit = null;

        thisClass.initQueryBuilder(null);

        $("#ucFilterName").val("");

        $("#ucEditFilterModal").modal();
        
        $('.rule-container .rule-actions .btn-danger').text('');
		$('.rule-container .rule-actions .btn-danger').addClass('ucListingFilterDeleteIcon');
		
        $('#ucFilterQueryBuilderUI').on('afterAddRule.queryBuilder', function(e, rule, error, value) {
        	$('.rule-container .rule-actions .btn-danger').text('');
        	$('.rule-container .rule-actions .btn-danger').addClass('ucListingFilterDeleteIcon');
        });
    };

    /*
     * @desc Converts the filter into json query and saves to server
     */
    this.saveFilterHandler = function()
    {
        var filter = $('#ucFilterQueryBuilderUI').queryBuilder('getRules');

        if (!$.isEmptyObject(filter)) {
            filter = JSON.stringify(filter, null, 2);
        }
        var mongoFilter = $('#ucFilterQueryBuilderUI').queryBuilder('getMongo');

        if (!$.isEmptyObject(mongoFilter)) {
            mongoFilter = JSON.stringify(mongoFilter, null, 2);
        }

        var filtername = $('#ucFilterName').val();

        if($.trim(filtername) == "")
        {
            alert("Filter Name is Required");
            return;
        }

        if(thisClass.filterOnEdit == null)
        {
            var filterObj = new UC_Filter();

            filterObj._id = 'F'+UC_Utils.guidGenerator();
            filterObj.creator = UC_UserSession.user._id;
            filterObj.clientId = UC_UserSession.user.company;
            filterObj.appId = uc_main.appController.currentAppId;
            filterObj.name = filtername;
            filterObj.filter = filter;
            filterObj.mongoFilter = mongoFilter;

            thisClass.userdefinedFiltersList.push(filterObj);

            if(!UC_UserSession.user.hasOwnProperty('app'))
            {
                UC_UserSession.user.app = {};
            }
            if(!UC_UserSession.user.app.hasOwnProperty(uc_main.appController.currentAppId))
            {
                UC_UserSession.user.app[uc_main.appController.currentAppId] = {};
            }
            if(!UC_UserSession.user.app[uc_main.appController.currentAppId].hasOwnProperty("filterOrder"))
            {
                thisClass.updateFilterOrder();
            }
            else
            {
                UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder.push(filterObj._id);
            }

            thisClass.saveAppPreference();
        }
        else
        {
            var filterObj = thisClass.filterOnEdit;

            filterObj.name = filtername;
            filterObj.filter = filter;
            filterObj.mongoFilter = mongoFilter;
        }

        UC_AJAX.call('FilterManager/updateFilter',{filter:filterObj},function(data,status,xhr)
        {
             if(data)
             {
                 if(data.status == "failure")
                 {
                     alert("An Error accured while saving data !");
                 }
                 else
                 {
                     $("#ucEditFilterModal").modal("hide");
                     thisClass.listUserdefinedFilters();

                     if(uc_main.visitorListController.currentFilterId == filterObj._id)
                     {
                         uc_main.visitorListController.resetPagination();
                         uc_main.visitorListController.getAllVisitors();
                     }

                 }
             }

        });
    };

    /*
     * @desc Changes the current filterin use
     */
    this.changeFilterHandler = function()
    {
    	$("#uc_tab_data_dashboard").hide();
        $("#uc_tab_data_listuser").show();
        
        var filterId = $(this).closest("li").attr("data-filterid");

        thisClass.changeCurrentFilter(filterId);

        uc_main.visitorListController.resetPagination();
        uc_main.visitorListController.getAllVisitors();
    };

    /*
     * @desc Removes the filter obj from local and db
     */
    this.deleteFilterHandler = function()
    {
        var filterObj = thisClass.getFilterById($(this).closest("li").attr("data-filterid"));

        if(confirm("Are you sure that you want to delete the filter?"))
        {
            for(var i = 0; i < thisClass.userdefinedFiltersList.length; i++)
            {
                var item = thisClass.userdefinedFiltersList[i];

                if(filterObj._id == item._id)
                {
                    thisClass.userdefinedFiltersList.splice(i, 1);
                    i--;
                }
            }

            if(UC_UserSession.user.hasOwnProperty('app') && UC_UserSession.user.app.hasOwnProperty(uc_main.appController.currentAppId) && UC_UserSession.user.app[uc_main.appController.currentAppId].hasOwnProperty('filterOrder'))
            {
                for(var j = 0; j < UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder.length; j++)
                {
                    var item = UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder[j];

                    if(filterObj._id == item)
                    {
                        UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder.splice(j, 1);
                        j--;
                    }
                }
            }


            if(uc_main.visitorListController.currentFilterId == filterObj._id)
            {
                thisClass.changeCurrentFilter("1");

                uc_main.visitorListController.resetPagination();
                uc_main.visitorListController.getAllVisitors();
            }


            UC_AJAX.call('FilterManager/deleteFilter',{filter:filterObj},function(data,status,xhr)
            {
                 if(data)
                 {
                     if(data.status == "failure")
                     {
                         alert("An Error accured while deleting");
                     }
                     else
                     {
                         thisClass.listUserdefinedFilters();
                     }
                 }

            });
        }
    };

    /*
     * @desc Updates the filter order based on sorting
     */
    this.updateFilterOrder = function(ev,ui)
    {
        var filterIdOrder = [];

        $("#ucUserdefinedFilterList li").each(function(){
            filterIdOrder.push($(this).attr("data-filterid"));
        });

        if(!UC_UserSession.user.hasOwnProperty('app'))
        {
            UC_UserSession.user.app = {};
        }
        if(!UC_UserSession.user.app.hasOwnProperty(uc_main.appController.currentAppId))
        {
            UC_UserSession.user.app[uc_main.appController.currentAppId] = {};
        }
        UC_UserSession.user.app[uc_main.appController.currentAppId].filterOrder = filterIdOrder;

        thisClass.saveAppPreference();
    };

    /*
     * @desc Saves the filter order to server
     */
    this.saveAppPreference = function()
    {

        UC_AJAX.call('UserManager/updateAppPreference',{user:UC_UserSession.user},function(data,status,xhr)
        {
            if(data)
            {
                if(data.status == "failure")
                {
                    alert("An Error accured while saving data");
                }
            }

        });
    };

    /*
     * @desc Changes the current filter and saves the preference to the server
     * @param filterId - id of the filter to be selected
     */
    this.changeCurrentFilter = function(filterId)
    {

        uc_main.visitorListController.currentFilterId = filterId;

        if(!UC_UserSession.user.hasOwnProperty('app'))
        {
            UC_UserSession.user.app = {};
        }
        if(!UC_UserSession.user.app.hasOwnProperty(uc_main.appController.currentAppId))
        {
            UC_UserSession.user.app[uc_main.appController.currentAppId] = {};
        }
        UC_UserSession.user.app[uc_main.appController.currentAppId].currentFilter = filterId;

        thisClass.saveAppPreference();

        //thisClass.selectCurrentFilter();
    };

    /*
     * @desc Selects the current filter to differentiate in ui
     */
    this.selectCurrentFilter = function()
    {
        $("#ucPredefinedFilterList li,#ucUserdefinedFilterList li").removeClass("ucCurrentFilter");
        $("#ucPredefinedFilterList li[data-filterid='"+uc_main.visitorListController.currentFilterId+"']").addClass("ucCurrentFilter");
        $("#ucUserdefinedFilterList li[data-filterid='"+uc_main.visitorListController.currentFilterId+"']").addClass("ucCurrentFilter");
    };
}
