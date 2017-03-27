/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 * 
 * @desc Common Utility functions shared across classes
 * 
 */

var UC_Utils = (function() {
	
	
		

	  return { // public interface
		
	
	    /**
	     * @desc generate uuids
	     * @return the uniquely generated id
	     */
	    guidGenerator: function()
	    {
	        var S4 = function() {
	           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	        };
	        return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
	    },

	    isValidEmail : function(email)
	    {
	    	  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	    	  return regex.test(email);
	    },
	    
	    /**
	     * @desc Search an object array based on it's key value
	     * @param arr: The array to search
	     * @param key: key of the object
	     * @param val: value to search for
	     * @return return the found index or -1
	     */
	    
	    searchObjArray: function(arr, key, val)
	    {
	    	var indx = -1;
	    	
	    	arr.forEach(function(elem, idx) 
	    	{
	    		if (elem[key] === val)
	    		{
	    			indx = idx;
	    			return;
	    		}
	    	});
	    	
	    	return indx;

	    },
	    /*
	     * @desc Returns query parameter value based on name 
	     * @param name:Name of the parameter
	     * @param url : Url to be parsed,if not provided takes current window url
	     */
	    getParameterByName : function(name, url) {
	        if (!url) {
	          url = window.location.href;
	        }
	        name = name.replace(/[\[\]]/g, "\\$&");
	        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	            results = regex.exec(url);
	        if (!results) return null;
	        if (!results[2]) return '';
	        return decodeURIComponent(results[2].replace(/\+/g, " "));
	    }
	   
	  };
	})();
