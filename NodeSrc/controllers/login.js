var express = require("express");
var app = require("../server").passport;
var passport = require("../server").passport;


class LogIn {


    constructor(basePath)
    {

        this.app = app;
        this.passport = passport;

        this.router = express.Router(); //eslint-disable-line new-cap

        // Route definitions for this controller
        this.router.get("/", (req,res) => { this.index(req,res) });
        this.router.post("/validateuser", (req,res) => { this.validateUser(req,res) });
    }

    // GET /
    index(req, res)
    {
      res.render('login')
    }

    // POST login/validateuser
    validateUser(req,res)
    {
      this.passport.authenticate('local', function(err, user) {
             if (err)
             {
               return res.json({ error: err.message });
             }
            if (!user)
             {
               return res.json({error : "Invalid Login"});
             }
            req.login(user, {}, function(err)
            {
              if (err) { return res.json({error:err}); }
              return res.json(user);
            })
          })(req, res);
    }



    // this.renderView = function(response, viewName, localData = {}) {
    //     let viewPath = this.basePath + "/" + viewName;
    //     let defaultData = {
    //         title: "~~~Unknown~~~"
    //     };
    //     let data = extend(defaultData, localData);
    //     response.render(viewPath, data);
    // }


}

module.exports.login = LogIn;
