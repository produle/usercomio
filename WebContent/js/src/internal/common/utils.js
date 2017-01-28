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
	    
	    resolveUrls: function(feedbackMsg) 
	    {
	    	var resolvedMsg = feedbackMsg;
	    	
	    	var urlPattern = /\b(https?:\/\/)?[a-zA-Z0-9\/\-:]+(\.[a-z0-9-+&@#\/%?=~_|!:,;]+)+/gi;
	    	var protocolList = /^((https?):\/\/)/i;
	    	var linkTemplate = "<a href='{0}' target='_blank'>{0}</a>";

	    	var urlList = urlPattern.exec(feedbackMsg),
		        currentUrl = "";

		     while(urlList !== null) 
		     {
		        currentUrl = urlList[0];
		        if(!protocolList.test(currentUrl)) {
		            currentUrl = "http\:\/\/" + currentUrl;
		        }
		        resolvedMsg = resolvedMsg.replace(urlList[0], linkTemplate.replace("{0}", currentUrl).replace("{0}", urlList[0]));
		        urlList = urlPattern.exec(feedbackMsg);
		     }
	        						
			return resolvedMsg;
		 },
	    /**
	     * @desc trim string of whitespace
	     * @param s: String to be trimmed
	     * @return return the trimmed string value
	     */
        trim: function(s)
	    {
	    	var l=0; var r=s.length -1;
	    	while(l < s.length && s[l] == ' ')
	    	{	l++; }
	    	while(r > l && s[r] == ' ')
	    	{	r-=1;	}
	    	return s.substring(l, r+1);
	    },
	    
	    /**
	     * @desc return the value of checkbox
	     * @param chkID: html id of the checkbox
	     * @return return boolen value
	     */
        getCheckBoxValue: function(chkID)
	    {
	    	if ($('#'+chkID).is(':checked'))
				return true;
			else
				return false;
	    },
	    
	    /**
	     * @desc converts coordinates from local to global (stage or page)
	     * @param _el: the html element for which the coordinates need to be converted
	     * @return the new global coordinates for the element
	     */
	     localToGlobal: function( _el ) {  
             var      
                target = _el,   
                target_width = target.offsetWidth,   
                target_height = target.offsetHeight,  
                target_left = target.offsetLeft,  
                target_top = target.offsetTop,  
                gleft = 0,   
                gtop = 0,  
                rect = {};  
                 
             var moonwalk = function( _parent ) {  
                 if (!!_parent) {  
                     gleft += _parent.offsetLeft;  
                     gtop += _parent.offsetTop;  
                     moonwalk( _parent.offsetParent );  
                 } else {  
                     return rect = {   
                          top: target.offsetTop + gtop,   
                          left: target.offsetLeft + gleft,   
                          bottom: (target.offsetTop + gtop) + target_height,   
                          right: (target.offsetLeft + gleft) + target_width   
                     };  
                 }  
             };  
             moonwalk( target.offsetParent );  
             return rect;  
         } , 
         
         /**
 	     * @desc converts coordinates from global to local (stage or page)
 	     * @param e: the global event point to be converted to local
 	     * @param elementid: the HTML element for which the local point has to be determined
 	     * @return the new global coordinates for the element
 	     */
 	     globalToLocalPoint: function( e, elementid ) {  
              
 	    	var localoffsetX=$("#"+elementid).offset().left;
 	        var localoffsetY=$("#"+elementid).offset().top;

 	        var localx =Math.floor(e.pageX-localoffsetX);
 	        var localy =Math.floor(e.pageY-localoffsetY);
 	        
 	         var lpt = new Object();
 	         lpt.x = localx;
 	         lpt.y = localy;
 	         
 	         return lpt;
          } , 
          
          /**
   	     * @desc converts coordinates from global to local (stage or page)
   	     * @param x: the global x point to be converted to local
   	     * @param y: the global y point to be converted to local
   	     * @param elementid: the HTML element for which the local point has to be determined
   	     * @return the new global coordinates for the element
   	     */
   	     globalToLocalPoint2: function( x,y, elementid ) {  
                
   	    	var localoffsetX=$("#"+elementid).offset().left;
   	        var localoffsetY=$("#"+elementid).offset().top;

   	        var localx =Math.floor(x-localoffsetX);
   	        var localy =Math.floor(y-localoffsetY);
   	        
   	         var lpt = new Object();
   	         lpt.x = localx;
   	         lpt.y = localy;
   	         
   	         return lpt;
            } , 
            
          /**
   	     * @desc converts coordinates from local to global (stage or page)
   	     * @param xpt: local x point
   	     * @param ypt: local y point
   	     * @return the new local coordinates for the element
   	     */
   	     localToGlobalPoint: function(xpt,ypt,elementid) {  
                
   	    	var localoffsetX=$("#"+elementid).offset().left;
   	        var localoffsetY=$("#"+elementid).offset().top;   	        

   	        var localx =Math.floor(xpt+localoffsetX);
   	        var localy =Math.floor(ypt+localoffsetY);
   	        
   	         var lpt = new Object();
   	         lpt.x = localx;
   	         lpt.y = localy;
   	         
   	         return lpt;
         } , 
	    
	    /**
	     * @desc get month by number
	     * @param num: month's num
	     * @return month in name
	     */
	    getMonthByName: function(num)
	    {
	    	var m_names = new Array("Jan", "Feb", "Mar", 
	    			"Apr", "May", "Jun", "Jul", "Aug", "Sep", 
	    			"Oct", "Nov", "Dec");
	    	
	    	return m_names[num] ;
	    },
	    
	    /**
		 * @desc check for email validity
		 * @param emailAddress: email string to be checked
		 */
		isValidEmailAddress: function(emailAddress) 
		{
			var pattern2 = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);

			return pattern2.test(emailAddress);

		},

	    /**
	     * @desc find position of the object
	     * @param obj: HTML element  
	     * @return position object (x,y)
	     */
	    findPos: function(obj) 
	    {
	    	var curleft = curtop = 0;
	    	if (obj.offsetParent) {
	    		curleft = obj.offsetLeft
	    		curtop = obj.offsetTop
	    		while (obj = obj.offsetParent) {
	    			curleft += obj.offsetLeft
	    			curtop += obj.offsetTop
	    		}
	    	}
	    	return [curleft,curtop];
	    },

	    /**
	     * @desc Display short app notification message
	     * @param msg: message to be displayed
	     */
	    display_ActionIndicator: function(msg)
	    {
	    	$('#mfActionIndicator').css({
	    			position:'absolute',
	    			top: 0,
	    			left: (($(window).width()/2) - ($('#mfActionIndicator').width()/2))
	    		});
	    	
	    	$('#mfActionIndicatorMessage').text(msg);
	    	$("#mfActionIndicator").fadeTo("fast",1.5);
	    	
	    	$("#mfActionIndicator").css("z-index","1000"); 
	    	
	    	setTimeout(function(){$("#mfActionIndicator").css("display","none"); },2000);

	    	return;
	    },

	    /**
	     * @desc display popup menu
	     * @param parent: Parent HTML element
	     * @param named: Name of the popup menu HTML element
	     * @param e: Event like a mouse event
	     */
	    display_menu: function(parent,named,e)
	    {
	    	//get the named menu
	    	var menu_element = document.getElementById(named);
	    	//override the 'display:none;' style attribute
	    	menu_element.style.display = "";
	    	//get the placement of the element that invoked the menu...
	    	//var placement = findPos(parent);
	    	//...and put the menu there
	    	menu_element.style.left =e.pageX + "px";
	    	menu_element.style.top = e.pageY + "px";
	    	
	    	if((e.pageY + 10 + $("#"+named).height()) > $(window).height())
	    	{
	    		menu_element.style.top = (e.pageY - $("#"+named).height()) + "px";
	    	}
	    	
	    	return;
	    },

	    /**
	     * @desc hide popup menu
	     * @param named: name of the Popup HTML element
	     */
	    hide_menu: function(named)
	    {
	    	//get the named menu
	    	var menu_element = document.getElementById(named);
	    	//hide it with a style attribute
	    	
	    	if(menu_element)
	    	menu_element.style.display = "none";
	    	
	    	return;
	    },

	    /**
	     * @desc draw a rounded rectangle using outlines
	     * @param ctx: Canvas object
	     * @param x: x coordinate
	     * @param y: y coordinate
	     * @param cornerRadius: Amount of roundness for the rect
	     */
	    roundedRect2: function(ctx,x,y,w,h,cornerRadius)
	    {
	    	cornerRadius = cornerRadius/2;
	    		ctx.beginPath();
	    	   var theta, angle, cx, cy, px, py;
	            // make sure that w + h are larger than 2*cornerRadius
	            if (cornerRadius>Math.min(w, h)/2) {
	                cornerRadius = Math.min(w, h)/2;
	            }
	            // theta = 45 degrees in radians
	            theta = Math.PI/4;
	            // draw top line
	            ctx.moveTo(x+cornerRadius, y);
	            ctx.lineTo(x+w-cornerRadius, y);
	            //angle is currently 90 degrees
	            angle = -Math.PI/2;
	            // draw tr corner in two parts
	            cx = x+w-cornerRadius+(Math.cos(angle+(theta/2))*cornerRadius/Math.cos(theta/2));
	            cy = y+cornerRadius+(Math.sin(angle+(theta/2))*cornerRadius/Math.cos(theta /2));
	            px = x+w-cornerRadius+(Math.cos(angle+theta)*cornerRadius);
	            py = y+cornerRadius+(Math.sin(angle+theta)*cornerRadius);
	            ctx.quadraticCurveTo(cx, cy, px, py);
	            angle += theta;
	            cx = x+w-cornerRadius+(Math.cos(angle+(theta/2))*cornerRadius/Math.cos(theta/2));
	            cy = y+cornerRadius+(Math.sin(angle+(theta/2))*cornerRadius/Math.cos(theta /2));
	            px = x+w-cornerRadius+(Math.cos(angle+theta)*cornerRadius);
	            py = y+cornerRadius+(Math.sin(angle+theta)*cornerRadius);
	            ctx.quadraticCurveTo(cx, cy, px, py);
	            // draw right line
	            ctx.lineTo(x+w, y+h-cornerRadius);
	            // draw br corner
	            angle += theta;
	            cx = x+w-cornerRadius+(Math.cos(angle+(theta/2))*cornerRadius/Math.cos(theta/2));
	            cy = y+h-cornerRadius+(Math.sin(angle+(theta/2))*cornerRadius/Math.cos(theta/2));
	            px = x+w-cornerRadius+(Math.cos(angle+theta)*cornerRadius);
	            py = y+h-cornerRadius+(Math.sin(angle+theta)*cornerRadius);
	            ctx.quadraticCurveTo(cx, cy, px, py);
	            angle += theta;
	            cx = x+w-cornerRadius+(Math.cos(angle+(theta/2))*cornerRadius/Math.cos(theta/2));
	            cy = y+h-cornerRadius+(Math.sin(angle+(theta/2))*cornerRadius/Math.cos(theta/2));
	            px = x+w-cornerRadius+(Math.cos(angle+theta)*cornerRadius);
	            py = y+h-cornerRadius+(Math.sin(angle+theta)*cornerRadius);
	            ctx.quadraticCurveTo(cx, cy, px, py);
	            // draw bottom line
	            ctx.lineTo(x+cornerRadius, y+h);
	            // draw bl corner
	            angle += theta;
	            cx = x+cornerRadius+(Math.cos(angle+(theta/2))*cornerRadius/Math.cos(theta /2));
	            cy = y+h-cornerRadius+(Math.sin(angle+(theta/2))*cornerRadius/Math.cos(theta/2));
	            px = x+cornerRadius+(Math.cos(angle+theta)*cornerRadius);
	            py = y+h-cornerRadius+(Math.sin(angle+theta)*cornerRadius);
	            ctx.quadraticCurveTo(cx, cy, px, py);
	            angle += theta;
	            cx = x+cornerRadius+(Math.cos(angle+(theta/2))*cornerRadius/Math.cos(theta /2));
	            cy = y+h-cornerRadius+(Math.sin(angle+(theta/2))*cornerRadius/Math.cos(theta/2));
	            px = x+cornerRadius+(Math.cos(angle+theta)*cornerRadius);
	            py = y+h-cornerRadius+(Math.sin(angle+theta)*cornerRadius);
	            ctx.quadraticCurveTo(cx, cy, px, py);
	            // draw left line
	            ctx.lineTo(x, y+cornerRadius);
	            // draw tl corner
	            angle += theta;
	            cx = x+cornerRadius+(Math.cos(angle+(theta/2))*cornerRadius/Math.cos(theta /2));
	            cy = y+cornerRadius+(Math.sin(angle+(theta/2))*cornerRadius/Math.cos(theta /2));
	            px = x+cornerRadius+(Math.cos(angle+theta)*cornerRadius);
	            py = y+cornerRadius+(Math.sin(angle+theta)*cornerRadius);
	            ctx.quadraticCurveTo(cx, cy, px, py);
	            angle += theta;
	            cx = x+cornerRadius+(Math.cos(angle+(theta/2))*cornerRadius/Math.cos(theta /2));
	            cy = y+cornerRadius+(Math.sin(angle+(theta/2))*cornerRadius/Math.cos(theta /2));
	            px = x+cornerRadius+(Math.cos(angle+theta)*cornerRadius);
	            py = y+cornerRadius+(Math.sin(angle+theta)*cornerRadius);
	            ctx.quadraticCurveTo(cx, cy, px, py);
	     		ctx.stroke();
	     		
	     		return;
	    				
	    },

	    /**
	     * @desc draw a rounded rectangle
	     * @param ctx: Canvas object
	     * @param x: x coordinate
	     * @param y: y coordinate
	     * @param radius: Amount of roundness for the rect
	     */		     
	    roundedRect: function(ctx,x,y,width,height,radius)
	    {
	    	 ctx.beginPath();
	    	
	    	
	    	 ctx.moveTo(x,y+radius);
	    	 ctx.lineTo(x,y+height-radius);
	    	 ctx.quadraticCurveTo(x,y+height,x+radius,y+height);
	    	 ctx.lineTo(x+width-radius,y+height);
	    	 ctx.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);
	    	 ctx.lineTo(x+width,y+radius);
	    	 ctx.quadraticCurveTo(x+width,y,x+width-radius,y);
	    	 ctx.lineTo(x+radius,y);
	    	 ctx.quadraticCurveTo(x,y,x,y+radius);
	    	 ctx.stroke();
	    	 
	    	 return;
	    				
	    },

	    /**
	     * @desc converts #hex color code to RGB values obj
	     * @param hex: Hex value of color to be converted
	     * @param alpha: Alpha value of the color
	     * @return the rgba object containing all values
	     */
	    hexToRGB: function(hex,alpha)
	    {
	    	alpha = typeof(alpha) != 'undefined' ? alpha : "1";
	    	
	    	var rgbObj = {
	    		red: ((hex & 0xFF0000) >> 16),
	    		green: ((hex & 0x00FF00) >> 8),
	    		blue: ((hex & 0x0000FF))
	    	};
	    					
	    	return "rgba("+rgbObj.red+","+rgbObj.green+","+rgbObj.blue+","+alpha+")";
	    },

	    /**
	     * @desc find random number in range
	     * @param min: Minimum value in range
	     * @param max: Maximum value in range
	     * @return a random number in the range
	     */
	    randomInRange: function(min, max) 
	    {
	        var scale = max - min;
	        return Math.floor(Math.random() * scale + min);
	    },

	    /**
	     * @desc Get Profile picture based on email 
	     * @param email: Email of the gravatar (id)
	     * @param size: Size of the gravatar 16,24,32...
	     * @return a url to the gravatar image of that email
	     */
	    get_gravatar: function(email, size) 
	    {
	    	 
	        // MD5 (Message-Digest Algorithm) by WebToolkit
	        // http://www.webtoolkit.info/javascript-md5.html
	     
	        var MD5=function(s){function L(k,d){return(k<<d)|(k>>>(32-d))}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H)}if(I|d){if(x&1073741824){return(x^3221225472^F^H)}else{return(x^1073741824^F^H)}}else{return(x^F^H)}}function r(d,F,k){return(d&F)|((~d)&k)}function q(d,F,k){return(d&k)|(F&(~k))}function p(d,F,k){return(d^F^k)}function n(d,F,k){return(F^(d|(~k)))}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F)}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F)}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F)}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F)}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]|(G.charCodeAt(H)<<d));H++}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa}function B(x){var k="",F="",G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F="0"+G.toString(16);k=k+F.substr(F.length-2,2)}return k}function J(k){k=k.replace(/rn/g,"n");var d="";for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x)}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128)}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128)}}}return d}var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=J(s);C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g)}var i=B(Y)+B(X)+B(W)+B(V);return i.toLowerCase()};
	     
	        var size = size || 80;
	     
	        return 'https://www.gravatar.com/avatar/' + MD5(email) + '.jpg?d=mm&rating=G&s=' + size;
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

	    }
	   
	  };
	})();
