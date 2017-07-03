/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc The main server file that runs the application and handles all the requests
 *
 */

const express = require('express');
const app = express();
const path = require("path");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expresssession = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const utils = require('./core/utils').utils;
const socket = require('./rtcserver');


//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

var config = require('config');

// initially set to the development platform 
global.prodEnvType = false;

if(config.has("database")) {

    var dbhost = config.get("database.host");
    var dbport = config.get("database.port");
    var dbuser = config.get("database.user");
    var dbpass = config.get("database.pass");
    var dbname = config.get("database.name");
    var dbconnectionstring = config.get("database.connectionstring");
    var dbconnectiontype = config.get("database.connectiontype");

    var credentials = "";
    if(dbuser != "")
    {
        credentials = dbuser;
        if(dbpass != "")
        {
            credentials = credentials + ':' + dbpass;
        }
        credentials = credentials + '@';
    }

    // Connection URL. This is where your mongodb server is running.
    var url = 'mongodb://'+credentials+dbhost+':'+dbport+'/'+dbname;
    if(dbconnectiontype == "Advanced")
    {
        url = dbconnectionstring;
    }

    // Use connect method to connect to the Server
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        //HURRAY!! We are connected. :)
        //HURRAY!! We are connected. :)
        console.log('Connection established to', url);

        global.db = db;

      }
    });
}
else {
    console.log("Config not found");
}


var serverPort = 3000;

if(process.argv[2] == "prod")
{
	global.prodEnvType = true;
	//serverPort = 80;
} 


const PUBLIC_SRC_PATH = path.resolve(__dirname, '../WebContent');


app.set('views', path.join(PUBLIC_SRC_PATH, '/ui'));
app.set('view engine', 'ejs');

app.use(express.static(PUBLIC_SRC_PATH));
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(expresssession({ secret: 'ilovescotchscotchyscotchscotch', resave: true, saveUninitialized: true })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


app.listen(serverPort, function() {
  console.log('listening on '+serverPort);
})

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


passport.use(new LocalStrategy(
  function(username, password, done) {


    // Get the documents collection
    var User = global.db.collection('users');


    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!(user.password == utils.encrypt(password))) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      delete user.password; //To avoid the encrypted password transmitted to client
      return done(null, user);
    });
  }
));


exports.passport = passport;
exports.app = app;



var viewRender =  require('./viewrenderer').ViewRenderer;
var views = new viewRender();

var controllerList = {};


fs.readdirSync(path.join(__dirname, "Managers")).forEach(function (file) {
    if (file.substr(-3) === ".js") {
        var basePath = path.basename(file, ".js");
        var Controller = require(`./Managers/${file}`);
        controllerList[basePath] = new Controller[basePath]();
        app.use(`/${basePath}`, controllerList[basePath].router);
    }
});
