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
    if (!event) return res.redirect('/');

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
  var updates = req.body;
  req.event.modify(updates, req.user, function (err, event) {
    if (err) return app.err(err, res);
    return res.jsonp(event.toJSON());
  });
}

exports.invite = function (req, res) {
  var actor = req.user;
  var loadedUser = req.loadedUser; // Used for one user invitation
  var emails = req.body; // Used for invitations by email
  var event = req.event;
  var organizator = event.organizator;

  if (loadedUser) { // Invite one user
    actor.inviteToEvent(event, loadedUser, function (err) {
      if (err) return app.err(err, res);
      return res.sendStatus(200);
    });
  } else if (emails && emails.length !== 0) { // Invite users based on emails
    var parallelTasks = [];
    _.each(emails, function (email) {
      parallelTasks.push(function (next) {
        actor.inviteToEventByEmailOrUsername(event, email, next);
      });
    });
    async.parallel(parallelTasks, function (err) {
      if (err) return app.err(err, res);
      return res.sendStatus(200);
    });
  } else { // Invite all followers of user loggedIn
    var parallelTasks = [];
    _.each(actor.followers, function (follower) {
      parallelTasks.push(function (next) {
        actor.inviteToEvent(event, follower, next);
      });
    });
    async.parallel(parallelTasks, function (err) {
      if (err) return app.err(err, res);
      return res.sendStatus(200);
    })
  }
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
  var date = moment(parseInt(req.query.d));
  app.Event.loadEmptyEvent(date, req.user, function (err, event) {
    if (err) return app.err(err, res);
    return res.render('app/event.server.jade', {event: JSON.stringify(event)});
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

  res.format({
    html: function () {
      return res.render('app/event.server.jade');
    },
    json: function () {
      var jsonEvent = event.toJSON();
      if (user) {
        jsonEvent.canAttend = user.canAttendEvent(event);
        return res.jsonp(jsonEvent);
      }
      else if (event.permissions.visibility === 'public') {
        return res.jsonp(jsonEvent);
      }else {
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
