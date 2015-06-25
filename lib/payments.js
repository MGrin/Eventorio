'use strict';

var stripe = require('stripe')();

var app;

module.exports = function (myApp) {
  app = myApp;
  stripe.setApiKey(app.config.stripe.key);
};