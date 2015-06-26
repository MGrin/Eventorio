'use strict';

var app;
var async = require('async');

exports.init = function (myApp) {
  app = myApp;
};

exports.processStripeToken = function (req, res) {
  var user = req.user;
  var event = req.event;
  var ticketType = req.ticket;
  var token = req.body;

  var charge, ticket;

  async.series([
    function (next) {
      user.updateStripeCustomer(token, next);
    },
    function (next) {
      app.stripe.charges.create({
        amount: ticketType.price * 100,
        currency: 'chf',
        source: token.id
      }, function (err, c) {
        if (err) return next(err);

        charge = c;
        return next();
      });
    },
    function (next) {
      app.Ticket.create(event, user, ticketType, charge, function (err, t) {
        if (err) return next(err);

        ticket = t;
        return next();
      });
    }
  ], function (err) {
    if (err) return app.err(err, res);
    return res.send(ticket);
  });
};