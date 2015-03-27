'use strict';

var _ = require('underscore');
var async = require('async');

var app;

exports.init = function (myApp) {
  app = myApp;
};

exports.query = function (req, res) {
  var user = req.user;
  var event = req.event;

  app.Comment.query(user, event, function (err, comments) {
    if (err) return app.err(err, res);
    return res.jsonp(comments);
  });
};

exports.create = function (req, res) {
  var user = req.user;
  var eventId = req.event.id;
  var content = req.body.content;

  app.Comment.create(user, eventId, content, function (err, comment) {
    if (err) return app.err(err, res);
    return res.jsonp(comment);
  })
};