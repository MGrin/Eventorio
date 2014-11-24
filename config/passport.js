/**
 * Manages authentication with facebook/google+/etc.
 */

'use strict';

/**
 * Module dependencies.
 */
var app;
var LocalStrategy = require('passport-local').Strategy;

var createUser;
var createOrUpdateUser;
var updateUser;

module.exports = function (myApp, passport) {
  app = myApp;
  var config = app.config;

  // serialize sessions
  passport.serializeUser(function (user, cb) {
    cb(null, user.id);
  });

  passport.deserializeUser(function (id, cb) {
    app.User.findOne({_id: id}, function (err, user) {
      cb(err, user);
    });
  });

  // Use loca strategy
  passport.use(new LocalStrategy(
    function(username, password, done) {
      app.User.findOne({username: new RegExp('^' + username +'$', 'i')}, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    }
  ));
};