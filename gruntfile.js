module.exports = function(grunt) {

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify'); 

   // Load the plugin that provides the "uglify" task for css files 
  grunt.loadNpmTasks('grunt-contrib-cssmin'); 

  grunt.initConfig({
  
    //minifying javascript files  
     uglify: {   
    	 
       jsfiles: {  
          files: {
        	   //convert all js files to single min file with excluding certain files to avoid other pages ready function certain events 
               'WebContent/dist/js/internal/internal.min.js': ['WebContent/js/src/internal/**/*.js','!**/passwordreset.js','!**/login.js' ],
               'WebContent/dist/js/internal/passwordreset.min.js': ['WebContent/js/src/internal/passwordreset.js' ],
               'WebContent/dist/js/internal/accounts/login.min.js': ['WebContent/js/src/internal/accounts/login.js' ],
          } 
       }, 
      }, 

     //minifying css files
     cssmin: { 
          cssfiles: { 
             files: {
            	 'WebContent/dist/styles/internal.min.css': ['WebContent/css/internal/**/*.css','!**/userregistration.css','!**/login.css','!**/userregistration.css','!**/usersetup.css','!**/style.css' ],
            	 'WebContent/dist/styles/userregistration.min.css': ['WebContent/css/internal/userregistration.css' ],
            	 'WebContent/dist/styles/login.min.css': ['WebContent/css/internal/login.css' ],
             }  
         },
      }, 
  });

  // calling uglify and cssmin function by default
  grunt.registerTask('default', ['uglify','cssmin']);
  
};
 

 