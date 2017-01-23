var express = require("express");
var app = require("../server").app;
var passport = require("../server").passport;


class User {

  constructor()
    {

        this.app = app;
        this.passport = passport;

        this.router = express.Router(); //eslint-disable-line new-cap

        // Route definitions for this controller
        this.router.get("/register",(req, res) => { this.index(req, res);  });
        this.router.post("/register",(req, res) => { this.registerUser(req,res);   });
    }

    // GET /user
    index(req, res)
    {
       res.render('userregistration')
    }

    // POST user/register
    registerUser(req,res)
    {
        // Get the documents collection
          var collection = global.db.collection('users');

          //Create some users
          var user1 = {username: req.body.username, password:req.body.password };

          collection.insert([user1], function (err, result) {
            if (err)
            {
              console.log(err);
            }
            else
            {
              console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
            }


          });

          

    }

}

module.exports.user = User;
