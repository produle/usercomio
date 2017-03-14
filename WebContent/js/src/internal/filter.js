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

    this.rivetPredefinedFiltersListObj = null;

    this.filterOnEdit = null;

	this.constructor = function()
	{

        thisClass.rivetPredefinedFiltersListObj = rivets.bind(
            document.querySelector('#ucPredefinedFilterList'), {
                list: thisClass.predefinedFiltersList
            }
        );

        thisClass.listPredefinedFilters();

        $(document).on("click","#ucPredefinedFilterList li",thisClass.editFilterHandler);
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
     * @desc Creates the instance of query builder for filter
     */
    this.initQueryBuilder = function(filterRule)
    {
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
          }]//,

          //rules: filterRule
        });
    };

    /*
     * @desc Opens the filter edit modal
     */
    this.editFilterHandler = function()
    {
        var filterObj = thisClass.getFilterById($(this).attr("data-filterid"));

        thisClass.filterOnEdit = filterObj;

        thisClass.initQueryBuilder(filterObj.filter);

        $("#ucFilterName").val(filterObj.name);

        $("#ucEditFilterModal").modal();
    };

    /*
     * @desc Obtains a filter from the list based on the id
     * @param filterId - id of the filter to be obtained
     */
    this.getFilterById = function(filterId)
    {
        for(var iter = 0 ; iter < thisClass.predefinedFiltersList.length; iter++)
        {
            var item = thisClass.predefinedFiltersList[iter];
            if(item.id == filterId)
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
        var result = $('#ucFilterQueryBuilderUI').queryBuilder('getMongo');

        if (!$.isEmptyObject(result)) {
            thisClass.filterOnEdit.filter = JSON.stringify(result, null, 2);
        }
        var mongoResult = $('#ucFilterQueryBuilderUI').queryBuilder('getMongo');

        if (!$.isEmptyObject(mongoResult)) {
            thisClass.filterOnEdit.mongoquery = JSON.stringify(mongoResult, null, 2);
        }

        //TODO Save the filter object to server
    };
}
