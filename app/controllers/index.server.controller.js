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

exports.app = function (req, res) {
  res.render('app/app.server.jade', {user: req.user, visible: 'full'});
};

exports.calendar = function (req, res) {
  res.render('app/app.server.jade', {user: req.user, visible: 'calendar'});
};

exports.news = function (req, res) {
  res.render('app/app.server.jade', {user: req.user, visible: 'news'});
};

exports.policy = function (req, res) {
  res.render('index/policy.jade');
};