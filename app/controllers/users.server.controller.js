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
      return app.err(err, res);
    }
    if (!user) {
      return app.err(new Error('No user found'), res);
    }
    req.logIn(user, function(err) {
      if (err) {
        return app.err(err, res);
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

exports.activate = function (req, res) {
  if (!req.userToActivate) return res.redirect('/');
  req.userToActivate.activationCode = undefined;
  res.userToActivate.save(function (err) {
    if (err) return app.err(err, res);
    return res.redirect('/app');
  });
}

exports.update = function (req, res) {
  var field = req.body.name;
  var value = req.body.value;
  var user = req.user;

  if (req.user.id !== req.userToShow.id) return app.err('Not authorized!', res);

  user.update(field, value, function (err) {
    if (err) return app.err(err, res);
    return res.jsonp(200);
  })
}

exports.follow = function (req, res) {
  var currentUser = req.user;
  var userId = req.body.userId;
  if (!userId) return app.err('No user to follow was given!', res);

  app.User.findById(userId, function (err, user) {
    if (err) return app.err(err, res);
    if (!user) return app.err(new Error('No user found for given id!'), res);

    currentUser.follow(user, function (err) {
      if (err) return app.err(err, res);
      return res.jsonp(200);
    });
  })
}

exports.unfollow = function (req, res) {
  var currentUser = req.user;
  var userId = req.body.userId;
  if (!userId) return app.err('No user to unfollow was given!', res);

  app.User.findById(userId, function (err, user) {
    if (err) return app.err(err, res);
    if (!user) return app.err(new Error('No user found for given id!'), res);

    currentUser.unfollow(user, function (err) {
      if (err) return app.err(err, res);
      return res.jsonp(200);
    });
  });
}

exports.attend = function (req, res) {
  var user = req.user;
  var event = req.event;

  user.attendEvent(event, function (err) {
    if (err) return app.err(err, res);
    return res.jsonp(200);
  });
}

exports.quit = function (req, res) {
  var user = req.user;
  var event = req.event;

  user.quitEvent(event, function (err) {
    if (err) return app.err(err, res);
    return res.jsonp(200);
  });
}

exports.news = function (req, res) {
  var user = req.user;
  var offset = req.query.offset || 0;
  var quantity = req.query.quantity || 20;

  app.Action.getUserNewsFeed(user, offset, quantity, function (err, news) {
    if (err) return app.err(err, res);
    return res.jsonp(news);
  });
}

exports.loadByUsername = function (req, res, next, username) {
  if (username === 'me') {
    if (req.user) {
      return res.format({
        html: function () {
          res.redirect('/users/'+req.user.username);
        },
        json: function () {
          res.jsonp(req.user.toJSON());
        }
      });
    } else {
      return res.format({
        html: function () {
          res.redirect('/');
        },
        json: function () {
          res.send(500);
        }
      });
    }
  }
  app.User.loadByUsername(username, function (err, user) {
    if (err) return app.err(err, res);
    if (!user) return app.err(new Error('No user found: ' + username), res);

    req.userToShow = user;
    return next();
  })
};

exports.loadByActivationCode = function (req, res, next, activationCode) {
  app.User.findOne({activationCode: activationCode}, function (err, user) {
    if (err) return app.err(err, res);
    if (!user) return res.redirect('/');

    req.userToActivate = user;
    return next();
  })
};

exports.show = function (req, res) {
  return res.format({
    html: function () {
      res.render('app/user.server.jade');
    },
    json: function () {
      return res.jsonp(req.userToShow.toJSON());
    }
  });
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
    res.redirect('/');
  }
};
