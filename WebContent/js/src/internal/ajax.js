/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Centerailized function which handles all the ajax calls
 *
 */

function UC_AJAXController()
{

  var thisClass = this;

  thisClass.baseUrl  = "http://localhost:3000";

  this.get = function(reqObj,successCallback)
  {
    var url = thisClass.getUrl(reqObj.endpoint);

    $.get(url).done(function(data,status,xhr)
    {
      successCallback(data,status,xhr);

    }).fail(function(error)
    {
        thisClass.ajaxError(error);
    });
  },

  this.post = function(reqObj,successCallback)
  {
    var url = thisClass.getUrl(reqObj.endpoint);

    $.post(url,reqObj.data).done(function(data,status,xhr)
    {
      successCallback(data,status,xhr);

    }).fail(function(error)
    {
        thisClass.ajaxError(error);
    });
  }

  this.getUrl = function(endpoint)
  {
    var url =   thisClass.baseUrl;

    if(endpoint)
    {
        url = url + '/' + endpoint;
    }

    return url;
  }

  this.ajaxError =  function(error)
  {
    alert('An Error accured !');
  }



}

var UC_AJAX = new UC_AJAXController();
