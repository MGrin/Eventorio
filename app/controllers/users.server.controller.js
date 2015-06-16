'use strict';

/**
 * Module dependencies.
 */
var app; // jshint ignore:line
var passport = require('passport');
var _ = require('underscore');

var admins = ['mr6r1n@gmail.com'];

exports.init = function (myApp) {
  app = myApp; // jshint ignore:line
};

// saves a new session for a user if authentication was successful
exports.login = function (req, res) {
  if (req.user) { // FB and GP login
    var redirectUrl = req.body.redirect || '/users/' + req.user.id;
    return res.redirect(redirectUrl);
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return app.err(err, res);
    }
    if (!user) {
      return app.err(info, res);
    }
    req.logIn(user, function(err) {
      if (err) return app.err(err, res);

      var redirectUrl = req.body.redirect || '/users/' + user.id;
      return res.redirect(redirectUrl);
    });
  })(req, res);
};

exports.signup = function (req, res) {
  var fields = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  };

  app.User.createFromSignup(fields, function (err, user) {
    if (err) return app.err(err, res);

    req.logIn(user, function (err) {
      if (err) return app.err(err, res);

      var redirectUrl = req.body.redirect || '/users/' + user.id;
      res.redirect(redirectUrl);
    });
  });
};

exports.activate = function (req, res) {
  if (!req.userToActivate) return res.redirect('/');
  req.userToActivate.activationCode = undefined;
  res.userToActivate.save(function (err) {
    if (err) return app.err(err, res);
    return res.redirect(app.path.dashboard);
  });
};

exports.restorePassword = function (req, res) {
  var username = req.body.username;
  var email = req.body.email;

  if (!username || !email) return app.err(new Error ('Wrong email or username'), res);

  app.User.restorePassword(username, email, function (err) {
    if (err) return app.err(err, res);
    return res.sendStatus(200);
  });
};

exports.changePassword = function (req, res) {
  var user = req.user;
  var profile = req.profile;

  if (user.id !== profile.id) return app.err('Not authorized', res);

  user.changePassword(req.body, function (err) {
    if (err) return app.err(err, res);
    return res.sendStatus(200);
  });
};

exports.update = function (req, res) {
  var updates = _.pick(req.body.user, 'name', 'desc', 'pictureProvider', 'address', 'birthday');
  var user = req.user;

  if (req.user.id !== req.profile.id) return app.err('Not authorized!', res);

  user.update(updates, function (err, updatedUser) {
    if (err) return app.err(err, res);
    return res.jsonp(updatedUser);
  });
};

exports.load = function (req, res, next, username) {
  if (username === 'me') {
    if (req.user) {
      req.profile = req.user;
      return next();
    } else {
      return res.format({
        html: function () {
          res.redirect('/');
        },
        json: function () {
          res.sendStatus(500);
        }
      });
    }
  }

  app.User.loadUser(username, function (err, user) {
    if (err) return app.err(err, res);

    if (!user) return res.redirect('/');

    req.profile = user;
    return next();
  });
};

exports.loadByActivationCode = function (req, res, next, activationCode) {
  app.User.findOne({activationCode: activationCode}, function (err, user) {
    if (err) return app.err(err, res);
    if (!user) return res.redirect('/');

    req.userToActivate = user;
    return next();
  });
};

exports.show = function (req, res) {
  var user = req.user;
  if (user) user = user.toJSON();

  return res.format({
    html: function () {
      res.render('users/user.server.jade', {profile: req.profile, user: user});
    },
    json: function () {
      return res.jsonp(req.profile.toJSON());
    }
  });
};

/**
 * Logout
 */
exports.logout = function (req, res) {
  req.logout();

  var redirectUrl = req.query.redirect || '/';
  res.redirect(redirectUrl);
};

/*
 * Generic require login routing middleware
 */
exports.requiresLogin = function (req, res, next) {
 if (req.isAuthenticated()) {
   next();
 } else {
   var redirectUrl = req.query.redirect || '/';
   res.redirect(redirectUrl);
 }
};

exports.requiresCompleteProfile = function (req, res, next) {
  var user = req.user;

  if (user.isComplete || admins.indexOf(user.email) > -1) {
    next();
  } else {
    var redirectUrl = req.query.redirect || '/';
    res.redirect(redirectUrl);
  }
};
