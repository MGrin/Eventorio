'use strict';

var app;

exports.init = function (myApp) {
  app = myApp;
};

/**
 * Forwards the user to welcome page or home page depending on whether she is logged in
 */
exports.index = function (req, res) {
  var user = req.user;

  if (user) {
    res.render('app/app.server.jade', {user: user, title: 'Home'});
  } else {
    res.render('index/landing.server.jade',
               {title: app.config.name + ' - ' + app.config.tagline});
  }
};
