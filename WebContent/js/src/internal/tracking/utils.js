	


	var HTTP_PROTOCOL = (('https:' === document.location.protocol) ? 'https://' : 'http://');

	
	
	var utils = 
	{
			guidGenerator: function()
		    {
		        var S4 = function() {
		           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		        };
		        return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
		    },
			extendObj : function(parentObj,childObject) {
				   for (var i in childObject) {
				      if (childObject.hasOwnProperty(i)) {
				    	  parentObj[i] = childObject[i];
				      }
				   }
				   
				   return parentObj;
			}
	};
	
	var cookie = 
	{
			 createCookie : function(name,value,days) {
			    var expires = "";
			    if (days) {
			        var date = new Date();
			        date.setTime(date.getTime() + (days*24*60*60*1000));
			        expires = "; expires=" + date.toUTCString();
			    }
			    document.cookie = name + "=" + value + expires + "; path=/";
			},

			 readCookie : function(name) {
			    var nameEQ = name + "=";
			    var ca = document.cookie.split(';');
			    for(var i=0;i < ca.length;i++) {
			        var c = ca[i];
			        while (c.charAt(0)==' ') c = c.substring(1,c.length);
			        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
			    }
			    return null;
			},

			 eraseCookie: function(name) 
			 {
			    createCookie(name,"",-1);
			 }

	};
	
	/*
	 * AJAX Utility
	 */
	var xhr = {
			
				/**
				 * IE 5.5+, Firefox, Opera, Chrome, Safari XHR object
				 * Send Ajax Request in form encoded format
				 * @param string url
				 * @param function callback
				 * @param mixed data
				 */
				formdata : function(url,data,callbacl)
				{
					try {
						var x = new XMLHttpRequest();
						x.open(data ? 'POST' : 'GET', url, 1);
						x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
						x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
						x.onreadystatechange = function () {
							x.readyState > 3 && callback && callback(x.responseText, x);
						};
						x.send(data)
					} 
					catch (e) 
					{
						window.console && console.log(e);
					}
				},
				
				/**
				 * IE 5.5+, Firefox, Opera, Chrome, Safari XHR object
				 * Send Ajax Request in JSON format
				 * @param string url
				 * @param function callback
				 * @param mixed data
				 */
				raw :function(url, data,callback)
				{
					try {
						var x = new XMLHttpRequest ();
						x.open(data ? 'POST' : 'GET', url, 1);
						x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
						x.setRequestHeader('Content-type', 'application/json');
						x.onreadystatechange = function () {
							x.readyState > 3 && callback && callback(x.responseText, x);
						};
						x.send(data)
					} 
					catch (e) 
					{
						window.console && console.log(e);
					}
				},
	};
	