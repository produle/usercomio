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


 function UC_User()
 {

   var thisClass = this;

   this.id = null;
   this.username = null;
   this.password = null;

   this.cast = function(obj)
   {
      this.id = obj._id;  
      this.username = obj.username;
      this.password = obj.password;
   }

 }
