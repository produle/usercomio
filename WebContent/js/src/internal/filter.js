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

        thisClass.listPredefinedFilters();

        $(document).on("click","#ucUserdefinedFilterList li",thisClass.editFilterHandler);
        $(document).on("click","#ucAddFilterBtn",thisClass.addFilterHandler);
        $(document).on("click","#ucEditFilterSubmit",thisClass.saveFilterHandler);
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
                thisClass.userdefinedFiltersList = data.status;
                thisClass.rivetUserdefinedFiltersListObj.models.list = thisClass.userdefinedFiltersList;
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
            id: 'name',
            label: 'Name',
            type: 'string'
          }, {
            id: 'lastseen',
            label: 'Last Seen',
            type: 'integer',
            input: 'text',
            operators: ['less_or_equal', 'greater_or_equal', 'equal']
          }],

          rules: filterRule
        });
    };

    /*
     * @desc Opens the filter edit modal
     */
    this.editFilterHandler = function()
    {
        var filterObj = thisClass.getFilterById($(this).attr("data-filterid"));

        thisClass.filterOnEdit = filterObj;

        thisClass.initQueryBuilder(JSON.parse(filterObj.filter));

        $("#ucFilterName").val(filterObj.name);

        $("#ucEditFilterModal").modal();
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
            filterObj.appid = uc_main.appController.currentAppId;
            filterObj.name = filtername;
            filterObj.filter = filter;
            filterObj.mongoFilter = mongoFilter;
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
                 }
             }

        });
    };
}
