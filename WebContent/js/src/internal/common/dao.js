/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Data Access Objects (DAO) for transferring data to and from server
 *
 */



 /**
  * @desc UserSession object (singleton) for accessing the user object
  */
 var UC_UserSession = {

      user:null,

      getUser : function()
      {
        return this.user;
      }


 }


 /**
  * @desc Logged in user object
  */
 function UC_User() 
 {
 	var thisClass = this;

    this._id = "";
 	this.firstName = "";
 	this.lastName = "";
 	this.createDate = null;
 	this.username = "";
 	this.password = "";
 	this.company = "";
    this.app = {};
    this.token = null;
 	
 	this.cast = function(obj)
 	{
 		this._id = obj._id;
 		this.firstName = obj.firstName;
 		this.lastName = obj.lastName;
 		this.createDate = new Date(obj.createDate);
 		this.username = obj.username;
 		this.password = obj.password;
 		this.company = obj.company;
 		this.app = obj.app;
 		this.token = obj.token;
 	}
 	
 };
 
 /**
  * @desc App Data object
  */
 function UC_App() 
 {
 	var thisClass = this;
 		
 	this.id = "";
 	this.name = "";
 	this.clientid = "";
 	this.createDate = null;
 	this.creator = "";
 	
 	
 	this.cast = function(obj)
 	{
 		this.id = obj.id;
 	 	this.name = obj.name;
 	 	this.clientid = obj.clientid;
 	 	this.createDate = new Date(obj.createDate);
 	 	this.creator = obj.creator;
 	}
 	
 };


 /**
  * @desc Query Filter object
  */
 function UC_Filter()
 {
 	var thisClass = this;

 	this._id = null;
 	this.name = "";
 	this.filter = null;
 	this.mongoFilter = null;
 	this.createDate = null;
 	this.creator = null;
 	this.appid = null;

 	this.cast = function(obj)
 	{
 		this._id = obj._id;
 		this.name = obj.name;
 		this.filter = mongofilter;
 		this.mongoFilter = obj.mongoFilter;
 	 	this.createDate = new Date(obj.createDate);
 	 	this.creator = obj.createDate;
 	 	this.appid = obj.appid;
 	}

 };


 /**
  * @desc Visitor object sample
  */
 function UC_Visitor()
 {
 	var thisClass = this;

 	this._id = null;
 	this.appid = null;
 	this.visitordata = {
        name : "",
        email : "",
        created_at: null
        //Custom data will be available here
    };
 	this.visitormetainfo = {
        firstseen : null,
        lastseen : null
    };

 };


 /**
  * @desc Visitor Session object sample (Sessions collection)
  */
 function UC_VisitorSession()
 {
 	var thisClass = this;

 	this._id = null;
 	this.sessionid = null;
 	this.visitorid = null;
 	this.agentinfo = {
        browser : "",
        browserlanguage : "",
        os: "",
        platform: "",
        version: null
    };
 	this.visitormetainfo = {
        firstseen : null,
        lastseen : null
    };

 };
