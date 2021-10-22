//jshint esversion:6
//requires
require('dotenv').config()
const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");

// const salt = bcrypt.genSaltSync(12);
//connects to externals

mongoose.connect('mongodb://localhost:27017/listDB3');

//setup
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.use(express.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
//database


const listSchema = {
  item: String
};
const defaultList = {
  item: "<--- Click here to delete"
};
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  list: [listSchema]
});
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//routes
app.route('/')
  .get(function(req, res) {
    res.render('main');
  });

app.route('/register')
  .get(function(req, res) {
    res.render('register');
  })
  .post(function(req, res) {
    User.register({
      username: req.body.username,
      list: defaultList
    }, req.body.password, function(err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function() {
          res.redirect("/list");
        });
      }
    });
  });

app.route('/login')

  .post(passport.authenticate("local", {
    successRedirect: '/list',
    failureRedirect: '/'
  }));

app.route('/delete')
  .get(function(req, res) {
    res.redirect('/');
  })
  .post(function(req, res) {
    if (req.isAuthenticated()) {
      User.findOneAndDelete({
        username: req.user.username
      }, function(err) {
        if (!err) {
          console.log("User Deleted");
          res.redirect('/');
        } else {
          console.log("user not deleted");
          res.render("fuckup");
        };
      });
    } else {
      res.render("fuckup");
    }
  });

app.route('/deletepost')
  .post(function(req, res) {
    User.updateOne({}, {
      $pull: {
        "list": {
          "_id": req.body.checkbox
        }
      }
    }, function(err) {
      if (!err) {
        console.log("Successfully deleted checked item.");
        if (req.isAuthenticated()) {
          res.redirect("/list");
        } else {
          res.render("fuckup");
        }

      }
    });

  });
app.route('/add')
  .post(function(req, res) {
    User.update({}, {
      $push: {
        "list": {
          item: req.body.newItemToAdd
        }
      }
    }, function(err) {
      if (!err) {
        console.log("Successfully added new item.");
        if (req.isAuthenticated()) {
          res.redirect("/list");
        } else {
          res.render("fuckup");
        }

      }
    });

  });

app.route('/list')
  .get(function(req, res) {
    if (req.isAuthenticated()) {
      User.findOne({
        username: req.user.username
      }, function(err, foundUser) {
        if (!err) {
          if (foundUser) {
            res.render("list", {
              listTitle: foundUser.username,
              listObjects: foundUser.list
            });
          }
        }
      });


    } else {
      res.render("fuckup");
    }
  });
app.route('/logout')
  .get(function(req, res) {
    req.logout();
    res.redirect('/');
  })
  .post(function(req, res) {
    req.logout();
    res.redirect('/');
  });


//server
app.listen(3000, function() {
  console.log("app listening on port 3000");
});
