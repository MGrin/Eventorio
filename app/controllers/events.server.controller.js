'use strict';

var moment = require('moment');
var _ = require('underscore');
var async = require('async');

var app;

exports.init = function (myApp) {
  app = myApp;
};

exports.load = function (req, res, next, id) {
  if (id === 'new') return next();
  app.Event.load(id, function (err, event) {
    if (err) return app.err(err, res);
    if (!event) return res.redirect('/');

    req.event = event;
    return next();
  });
};

exports.create = function (req, res) {
  var fields = {
    name: req.body.title,
    desc: req.body.desc,
    location: req.body.location,
    date: req.body.date,
    picture: req.body.picture,
    visibility: req.body.visibility,
    attendance: req.body.attendance
  };
  var creator = req.user;
  app.Event.create(fields, creator, function (err, event) {
    if (err) return app.err(err, res);
    res.jsonp(event.toJSON());
  });
};

exports.update = function (req, res) {
  var fields = {
    name: req.body.name,
    desc: req.body.desc,
    location: req.body.location,
    date: req.body.date,
    isAllDay: req.body.allDay,
    picture: req.body.picture,
    visibility: req.body.visibility,
    attendance: req.body.attendance
  };
  req.event.modify(fields, req.user, function (err, event) {
    if (err) return app.err(err, res);
    return res.jsonp(event.toJSON());
  });
}

exports.invite = function (req, res) {
  var user = req.user;
  var emails = req.body;
  var event = req.event;
  var organizator = event.organizator;

  var parallelTasks = [];
  _.each(emails, function (email) {
    parallelTasks.push(function (next) {
      event.invite(user, email, next);
    });
  });
  async.parallel(parallelTasks, function (err) {
    if (err) return app.err(err, res);
    return res.send(200);
  });
}

exports.getParticipants = function (req, res) {
  var event = req.event;
  event.getParticipants(function (err, participants) {
    if (err) return app.err(err, res);
    return res.jsonp(participants);
  });
}

exports.createPage = function (req, res) {
  return res.render('app/event.server.jade', {event: {edit: true}});
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
  }
};

exports.show = function (req, res) {
  res.format({
    html: function () {
      return res.render('app/event.server.jade', {event: {}});
    },
    json: function () {
      var jsonEvent = req.event.toJSON();
      if (req.user || req.event.permissions.visibility === 'public') {
        jsonEvent.canAttend = req.user.canAttend(req.event);
        req.event.populateParticipantsForUser(req.user, function (err, participants) {
          jsonEvent.participants = participants;
          return res.jsonp(jsonEvent);
        });
      } else {
        return res.jsonp(404);
      }
    }
  });
};

exports.isAccessible = function (req, res, next) {
  var user = req.user;
  var event = req.event;

  if (event.permissions.visibility === 'public') {
    return next();
  } else {
    if (!user) return res.redirect('/');
    if (user.id === event.organizator.id) return next();

    if (event.permissions.visibility === 'followers'
        && (!event.organizator.followers || event.organizator.followers.indexOf(user._id)) === -1) return res.redirect('/');
    if (event.permissions.visibility === 'invitations'
        && event.invitedUsers.indexOf(user._id) === -1) return res.redirect('/');

    return next();
  }
}

exports.isAttandable = function (req, res, next) {
  var user = req.user;
  var event = req.event;

  if (event.permissions.attendance === 'public') {
    return next();
  } else {
    if (!user) return app.err(new Error('Please, login'), res);
    if (user.id === event.organizator.id) return next();

    if (event.permissions.attendance === 'followers'
        && (!event.organizator.followers || event.organizator.followers.indexOf(user._id)) === -1) {
        return app.err(new Error('You should follow ' + event.organizator.username + ' to be able to attend this event'), res);
    }
    if (event.permissions.attendance === 'invitations'
        && event.invitedUsers.indexOf(user._id) === -1) {
      return app.err(new Error('This event requires invitations'), res);
    }

    return next();
  }
}
