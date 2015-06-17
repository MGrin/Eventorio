'use strict';

var app;

exports.init = function (myApp) {
  app = myApp;
};

exports.load = function (req, res, next, id) {
  if (id === 'create') return next();

  app.Event.load(id, function (err, event) {
    if (err) return app.err(err, res);
    if (!event) return res.redirect('/');

    req.event = event;
    return next();
  });
};

exports.create = function (req, res) {
  var event = req.body;
  var creator = req.user;

  var errors = app.validator.validateEvent(event);
  if (errors) app.err(errors[0], res);

  app.Event.create(event, creator, function (err, event) {
    if (err) return app.err(err, res);
    res.jsonp(event.toJSON());
  });
};

exports.update = function (req, res) {
  var updates = req.body.event;

  var errors = app.validator.validateEvent(updates);
  if (errors) app.err(errors[0], res);

  req.event.modify(updates, req.user, function (err, event) {
    if (err) return app.err(err, res);
    return res.jsonp(event.toJSON());
  });
};

exports.getParticipants = function (req, res) {
  var event = req.event;
  event.getPeople(function (err, people) {
    if (err) return app.err(err, res);
    return res.jsonp(people);
  });
};

exports.query = function (req, res) {
  var params = req.query;

  if (params.participant && (!req.user || !req.profile || req.user.id !== req.profile.id)) delete params.participant;

  app.Event.query(params, function (err, events) {
    if (err) return app.err(err, res);
    return res.jsonp([events]);
  });
};

exports.show = function (req, res) {
  var user = req.user;
  var event = req.event;

  if (user) user = user.toJSON();
  if (event) event = event.toJSON();

  res.format({
    html: function () {
      return res.render('events/event.server.jade', {event: event, user: user});
    },
    json: function () {
      return res.jsonp(event);
    }
  });
};

exports.showCreationPage = function (req, res) {
  var user = req.user;
  if (user) user = user.toJSON();

  return res.render('events/event.server.jade', {event: {}, user: user});
};
