'use strict';

var app;

exports.init = function (myApp) {
  app = myApp;
};

/**
 * Forwards the user to welcome page or home page depending on whether she is logged in
 */
exports.index = function (req, res) {
  res.render('index/landing.server.jade', {user: req.user});
};

exports.app = function (req, res) {
  res.render('app/app.server.jade', {user: req.user});
};