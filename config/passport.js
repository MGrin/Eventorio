/**
 * Manages authentication with facebook/google+/etc.
 */

'use strict';

/**
 * Module dependencies.
 */
var app;
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google').Strategy;

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
    app.User.findOne({_id: id}, '+hashPassword +salt', function (err, user) {
      cb(err, user);
    });
  });

  // Use loca strategy
  passport.use(new LocalStrategy(
    function(username, password, done) {
      var usernameRE = new RegExp('^' + username +'$', 'i');
      app.User.findOne({username: usernameRE}, '+hashPassword +salt', function(err, user) {
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

  // Use facebook strategy
  passport.use(new FacebookStrategy({
    clientID: app.config.facebook.clientID,
    clientSecret: app.config.facebook.clientSecret,
    callbackURL: app.config.serverUrl + 'auth/facebook/callback'
  }, function (accessToken, refreshToken, profile, done) {
    app.User.createOrUpdate(profile, function (err, user) {
      return done(err, user);
    });
  }));

  passport.use(new GoogleStrategy({
    returnURL: app.config.serverUrl + 'auth/google/callback',
    realm: app.config.serverUrl
  }, function (identifier, profile, done) {
    profile.provider = "google";
    app.User.createOrUpdate(profile, function (err, user) {
      return done(err, user);
    });
  }));
};