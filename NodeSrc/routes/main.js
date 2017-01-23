'use strict';

module.exports = function(app,passport)
{



  // app.get('/register', function(req, res) {
  //   res.render('userregistration.html')
  // })
  //
  // app.post('/register', function(req, res) {
  //
  //   // Get the documents collection
  //     var collection = global.db.collection('users');
  //
  //     //Create some users
  //     var user1 = {username: req.body.username, password:req.body.password };
  //
  //     collection.insert([user1], function (err, result) {
  //       if (err)
  //       {
  //         console.log(err);
  //       }
  //       else
  //       {
  //         console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
  //       }
  //
  //       db.close();
  //     });
  //
  //     res.render('login');
  // })
  //
  //
  // app.get('/login', function(req, res) {
  //   res.render('login')
  // })
  //
  //
  // app.post('/login', function(req, res) {
  //   passport.authenticate('local', function(err, user) {
  //        if (err)
  //        {
  //          return res.json({ error: err.message });
  //        }
  //       if (!user)
  //        {
  //          return res.json({error : "Invalid Login"});
  //        }
  //       req.login(user, {}, function(err)
  //       {
  //         if (err) { return res.json({error:err}); }
  //         return res.json(user);
  //       })
  //     })(req, res);
  // });
  //
  // app.post('/logout', function (req, res){
  //   req.logOut();
  //   res.render('login');
  // });

}
