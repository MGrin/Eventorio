'use strict';

var app;
var landings;

exports.init = function (myApp) {
  app = myApp;
  landings = [
    {file: 'beer', message: 'Want to get a beer with your friends?'},
    {file: 'ski', message: 'Want to ride with your friends?'}];
};

exports.index = function (req, res) {
  if (req.user) return res.redirect(app.path.dashboard);

  var randomLanding = landings[app.lib.randomInt(0, landings.length - 1)];
  return res.render('index/landing.server.jade', {user: req.user, landing: randomLanding});
};

exports.dashboard = function (req, res) {
  res.render('app/dashboard.server.jade', {user: req.user});
};

exports.policy = function (req, res) {
  res.render('index/policy.jade');
};