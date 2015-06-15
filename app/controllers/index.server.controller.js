'use strict';

var app;

exports.init = function (myApp) {
  app = myApp;
};

exports.index = function (req, res) {
  if (req.user) return res.redirect('/users/' + req.user.id);
  return res.render('landing.server.jade');
};


exports.policy = function (req, res) {
  res.render('policy.jade');
};
