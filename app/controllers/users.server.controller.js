'use strict';

/**
 * Module dependencies.
 */
var app; // jshint ignore:line
var mongoose = require('mongoose');
var User = mongoose.model('User');
var passport = require('passport');
var async = require('async');

exports.init = function (myApp) {
  app = myApp; // jshint ignore:line
};

// saves a new session for a user if authentication was successful
exports.login = function (req, res) {
  app.logger.info(req.body);
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return app.err(err);
    }
    if (!user) {
      return app.err(new Error('No user found'));
    }
    req.logIn(user, function(err) {
      if (err) {
        return app.err(err);
      }
      return res.redirect('/app');
    });
  })(req, res);
};

exports.signup = function (req, res) {
  var fields = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.hashedPassword
  };

  app.User.create(fields, function (err, user) {
    if (err) return app.err(err, res);

    req.logIn(user, function (err) {
      if (err) return app.err(err, res);
      res.send(200);
    });
  });
};

exports.me = function (req, res) {
  res.format({
    html: function () {
      res.render(404);
    },
    json: function () {
      res.jsonp(req.user);
    }
  })
}

/**
 * Logout
 */
exports.logout = function (req, res) {
  req.logout();
  res.redirect('/');
};

/*
 * Generic require login routing middleware
 */
exports.requiresLogin = function (req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send(new Error('Not authenticated'));
  }
};
