'use strict';

var moment = require('moment');
var _ = require('underscore');
var async = require('async');
var sanitizeHtml = require('sanitize-html');

var app;
var sanitizeConfig;

exports.init = function (myApp) {
  app = myApp;
  sanitizeConfig = {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    allowedAttributes: {
      'a': ['href'],
      'img': ['src']
    }
  };
};

exports.load = function (req, res, next, id) {
  if (id === 'new') return next();

  app.Event.load(id, function (err, event) {
    if (err) return app.err(err, res);
    if (!event) return res.redirect(app.path.landing);

    req.event = event;
    return next();
  });
};

exports.create = function (req, res) {
  var updates = req.body;
  var creator = req.user;
  app.Event.create(updates, creator, function (err, event) {
    if (err) return app.err(err, res);
    res.jsonp(event.toJSON());
  });
};

exports.update = function (req, res) {
  var updates = req.body.event;
  req.event.modify(updates, req.user, function (err, event) {
    if (err) return app.err(err, res);
    return res.jsonp(event.toJSON());
  });
};

exports.attend = function (req, res) {

};

exports.invite = function (req, res) {
  var user = req.user;
  var emails = req.body.emails;
  var followers = req.body.followers;
  var event = req.event;

  if (user.id !== event.organizator.id) return app.err('Not allowed', 500);

  var parallelTasks = [];
  _.each(emails, function (email) {
    parallelTasks.push(function (next) {
      user.inviteToEventByEmailOrUsername(event, email, next);
    });
  });

  _.each(followers, function (follower) {
    parallelTasks.push(function (next) {
      user.inviteToEvent(event, follower, next);
    });
  });

  async.parallel(parallelTasks, function (err) {
    if (err) return app.err(err, res);
    return res.sendStatus(200);
  });
}

exports.remove = function(req, res) {
  var user = req.user;
  var event = req.event;

  event.removeEvent(user, function (err) {
      if (err) return app.err(err, res);
      return res.sendStatus(200);
  });
}

exports.removeTemporaryEvent = function (req, res) {
  var user = req.user;
  var tempId = req.query.tempId;

  user.removeTemporaryEvent(tempId, function (err) {
    if (err) return app.err(err);
  });

  app.pictures.removeTemporaryEvent(tempId, function (err) {
    if (err) return app.err(err, res);
    return res.sendStatus(200);
  });
}

exports.getParticipants = function (req, res) {
  var event = req.event;
  event.getPeople(function (err, people) {
    if (err) return app.err(err, res);
    return res.jsonp(people);
  });
}

exports.createPage = function (req, res) {
  app.Event.loadEmptyEvent(req.user, function (err, event) {
    if (err) return app.err(err, res);
    return res.render('app/event.server.jade', {event: event});
  });
}

exports.query = function (req, res) {
  var user = req.user;
  if (req.query.startDate && req.query.stopDate) {
    var startDate = moment(parseInt(req.query.startDate)).utc();
    var stopDate = moment(parseInt(req.query.stopDate)).utc();

    app.Event.queryByDateRange(startDate, stopDate, user, function (err, events) {
      if (err) return app.err(err, res);
      return res.jsonp(events);
    });
  } else if (req.query.userId) {
    var offset = req.query.offset || 0;
    var quantity = req.query.quantity || 10;
    app.Event.queryByUser(req.query.userId, offset, quantity, function (err, events) {
      if (err) return app.err(err, res);
      return res.jsonp(events);
    });
  } else if (req.query.q) {
    var searchQuery = req.query.q;
    var searchLimit = req.query.limit || 5;
    app.Event.search(searchQuery, user, searchLimit,  function(err, events){
      if (err) return app.err(err, res);
      return res.jsonp(events.map(function(event){
            return event.toJSON();
        }));
    });
  }
};

exports.show = function (req, res) {
  var user = req.user;
  var event = req.event;

  var jsonEvent = event.toJSON();
  jsonEvent.canBeAttended = event.canBeAttendedBy(user);
  res.format({
    html: function () {
      return res.render('app/event.server.jade', {event: jsonEvent});
    },
    json: function () {
      return res.jsonp(jsonEvent);
    }
  });
};

exports.isAccessible = function (req, res, next) {
  var user = req.user;
  var event = req.event;

  if (event.canBeViewedBy(user)) return next();
  return app.err('Access denied', res);
}

exports.isAttandable = function (req, res, next) {
  var user = req.user;
  var event = req.event;

  if (event.canBeAttendedBy(user)) return next();
  return app.err('Access denied', res);
}
