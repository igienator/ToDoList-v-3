.post(function(req, res) {
  User.findOne({login: req.body.username}, function(err, foundUser) {
    if (!err) {
      if (!foundUser) {
      User.register({login: req.body.username}, {list: {item: "<-- Click to Delete"}}, req.body.userpassword, function(err, user) {
          if (err) {
            console.log(err);
          } else {
            passport.authenticate("local")(req, res, function() {
              res.redirect("/list");
          };
        });
      } else {
        res.render('fuckup');
      }

  });
});
});
});
});
