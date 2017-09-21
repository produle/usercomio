/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Entry point act as a starting point for application
 *
 */

function UC_MainController()
{
	var thisClass = this;
	
	this.appController = new UC_AppController();
	this.dashboardController = new UC_DashboardController();
	this.visitorListController = new UC_VisitorListController();
	this.userController = new UC_UserController();
	this.filterController = new UC_FilterController();
	this.messagingController = new UC_MessagingController();
	this.rtcController = new UC_RTCController();

    this.rivetUserNameObj = null;
	
	this.constructor = function()
	{

        thisClass.appController.constructor();
        thisClass.dashboardController.constructor();
        thisClass.visitorListController.constructor();
        thisClass.userController.constructor();
        thisClass.filterController.constructor();
        thisClass.messagingController.constructor();
        
		thisClass.rtcController.sessionID = UC_Utils.guidGenerator();
		thisClass.rtcController.connect();

        thisClass.initRivetBinds();

        $(".uc_tab_trigger").on("click",thisClass.toggleTabs);

        $(document).on("click",".ucSwitchContentTrigger",thisClass.switchContent);
        
        $(".ucSwitchContentContainer").hide();
        $("#ucPageLoader").show();
        $("#ucMainDashboard").addClass("ucCurrentPage");
        
        $(".ucSideBarMenuTrigger, .ucUserDetails").on("click",thisClass.menuContainer);
        $(".ucSidebarCloseBtn").on("click",thisClass.closeMenuContainer);


        $(".mfTooltip").tooltip();

        $(document).on('click', function (e) {
            $('[data-toggle="popover"],[data-original-title]').each(function () {
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                    (($(this).popover('hide').data('bs.popover')||{}).inState||{}).click = false  // fix for BS 3.3.6
                }

            });
        });
        
        $(window).resize(function(){
        	thisClass.interfaceResize();
        });
        
        thisClass.interfaceResize();
	};

    /*
     * @desc Init all Binding reference objects for rivets
     */
	this.initRivetBinds = function()
	{
		thisClass.rivetUserNameObj = rivets.bind(
            document.querySelector('#uc_currentuser_name'), {
                currentUserName: UC_UserSession.user.firstName+" "+UC_UserSession.user.lastName
            }
        );
	};

    /**
     * @desc Toggles between tabs. This is a global function, not specific to specific tab group
     */
    this.toggleTabs = function()
    {
        $("."+$(this).attr("data-tabgroup-class")).hide();
        $("#"+$(this).attr("data-tabgroup-tabid")).show();

        $(this).closest(".btn-group").find(".btn").removeClass("active");
        $(this).addClass("active");
    };

    /**
     * @desc 
     */
    this.switchContent = function(e)
    {
    	var divID = $(this).attr("switch-to");
        $(".ucSwitchContentContainer").hide();
        $("#"+divID).show();
        if(divID!="uc_tab_data_dashboard")
        {
        	$('#ucPageLoader').show();
        }
        $(".ucSwitchContentTrigger").removeClass("ucCurrentPage");
        $(this).addClass("ucCurrentPage");
        
        thisClass.closeMenuContainer(e);
    };
    /**
     * @desc Responsive for Sidebar
     */

    this.menuContainer = function(e)
    {
    		e.stopPropagation();
    	
    	    if($('.ucSidebar,.ucMainContent,.ucIndexPageWrapper, body,  #ucHeader,.ucUserDetails').hasClass('open'))
    	    {
    	    	$( ".ucSidebar,.ucMainContent,.ucIndexPageWrapper, body , #ucHeader, .ucUserDetails" ).removeClass( "open" );
    	    	$("html, body").css({"overflow": "auto"}); 
    	    	
    	    	
    	    } else {
    	    	$( ".ucSidebar,.ucMainContent, .ucIndexPageWrapper, body , #ucHeader,.ucUserDetails" ).addClass( "open" );
    	    	$("html, body").css({"overflow": "hidden"}); 
    	    	
    	    }
    	    $( ".ucSideBarMenuTriggerWrapper .logo" ).hide();
    	    thisClass.interfaceResize(e);
    };
    /**
     * @desc Closing the sidebar
     */

    this.closeMenuContainer = function(e)
    {
    		e.stopPropagation();
    		$( ".ucSidebar,.ucMainContent,.ucIndexPageWrapper, body , #ucHeader, .ucUserDetails" ).removeClass( "open" );
    		$("html, body").css({"overflow": "auto"}); 
    		$( ".ucSideBarMenuTriggerWrapper .logo" ).show();
    		thisClass.interfaceResize(e);
    };
    /**
     * @desc Resize Div layouts by calculating current window size so we have a fixed window size application like a desktop app
     */
    this.interfaceResize  = function() 
	{
    	if($('.ucSidebar').length==1)
    		{
    		$('.ucSidebar').height($(window).height());
    		$('.ucTableWrapper').width($(window).width()-sidebarWidth);
    		}
    	
    	 var sidebarWidth = 0;
    	 if($('.ucSidebar').css("display") == "block")
    	{
    		 sidebarWidth = $('.ucSidebar').width() + 40;
    		 
    	}
    	 $('.ucUserDetails').height($(window).height());
    	 $('.ucTableWrapper').height($(window).height()-195); 
    	 
    	 
    	 $('#ucUserdefinedFilterList').height($(window).height() - ($('#ucUserdefinedFilterList').offset().top + 60)); 
    	 
    	 if($('#ucUserdefinedFilterList').get(0).scrollHeight > $('#ucUserdefinedFilterList').height())
    		 {
    		  $('#ucUserdefinedFilterList li .ucFilterSettingBtn'). css ('margin-right','5px');
    		  $('#ucUserdefinedFilterList li .badge'). css ('right','35px');
    		 }
    	 else{
    		 $('#ucUserdefinedFilterList li .ucFilterSettingBtn'). css ('margin-right','10px');
    		 $('#ucUserdefinedFilterList li .badge'). css ('right','40px');
    	 	}
	};
}
