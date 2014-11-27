'use strict';

/**
 * Module dependencies.
 */
var app; // all application-wide things like ENV, config, logger, etc
var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;
var _ = require('underscore');
var async = require('async');
var ObjectId = Schema.ObjectId;

var visLevels = ['public', 'followers', 'invitations'];
/**
 * Models
 */
exports.initModel = function (myApp) {
  app = myApp;
};

/**
 * Events Schema
 */
var EventSchema = exports.Schema = new Schema({
  name: String,
  desc: String,
  location: String,
  organizator: {
    type: ObjectId,
    ref: 'User'
  },
  date: Date,
  isAllDay: Boolean,
  picture: String,       // picture uploaded by user
  permissions: {
    visibility: {
      type: String,
      enum:  visLevels
    },
    attendance: {
      type: String,
      enum: visLevels
    }
  },

  invitedUsers: [{
    type: ObjectId,
    ref: 'User'
  }],

  invitedEmails: [{
    type: String
  }],

  attendees: [{
    type: ObjectId,
    ref: 'User'
  }]
});

EventSchema
  .virtual('id')
  .get(function () {
    return this._id.toString();
  });

EventSchema
  .virtual('participants')
  .get(function () {
    return this.invitedUsers.concat(this.attendees).concat(this.invitedEmails);
  });

EventSchema
  .virtual('readableDate')
  .get(function () {
    return moment(this.date).format('Do MMM YYYY');
  });

EventSchema
  .virtual('readableTime')
  .get(function () {
    if (this.isAllDay) return 'All day';

    return moment(this.date).format('HH:mm');
  });


EventSchema.methods = {
  modify: function (fields, organizator, cb) {
    if (this.organizator.id !== organizator.id) return cb(new Error('Not authorized'));

    fields.permissions = {
      visibility: fields.visibility || visLevels[0],
      attendance: fields.attendance || visLevels[0]
    }

    delete fields.visibility;
    delete fields.attendance;

    var that = this;
    _.each(_.keys(fields), function (key) {
      that[key] = fields[key];
    });

    return that.save(cb);
  },

  populateParticipantsForUser: function (user, cb) {
    // TODO make an intelligent algorithm to show event's participants based on the current user;
    app.User
    .find({_id: {$in: this.attendees}})
    .limit(6)
    .exec(function (err, users) {
      if (err) return cb(err);
      var res = [];
      _.each(users, function (u) {
        res.push(u.toJSON());
      });
      return cb(null, res);
    });
  },

  getParticipants: function (cb) {
    var resObject = {
      attendees: [],
      invited: []
    };

    var that = this;

    async.series([
      function (next) {
        if (!that.attendees || that.attendees.length === 0) {
          return next();
        }

        app.User.find({_id: {$in: that.attendees}}, function (err, attendees) {
          if (err) return next(err);
          _.each(attendees, function (us) {
            resObject.attendees.push(us.toJSON());
          });
          return next();
        });
      }, function (next) {
        if (!that.invitedUsers || that.invitedUsers.length === 0) {
          return next();
        }

        app.User.find({_id: {$in: that.invitedUsers}}, function (err, invited) {
          if (err) return next(err);
          _.each(invited, function (us) {
            resObject.invited.push(us.toJSON());
          });
          return next();
        });
      }
    ], function (err) {
      return cb(err, resObject);
    });
  },

  toJSON: function () {
    var resEvent = this.toObject({virtuals: true});
    delete resEvent._id;
    delete resEvent.__v;
    delete resEvent.modified;
    delete resEvent.organizator._id;
    delete resEvent.organizator.__v;
    delete resEvent.organizator.modified;
    delete resEvent.organizator.password;
    delete resEvent.organizator.hashPassword;
    delete resEvent.organizator.salt;
    return resEvent;
  }
};

EventSchema.statics = {
  load: function (id, cb) {
    app.Event
      .findById(id)
      .populate('organizator')
      .exec(cb);
  },

  replaceInvitations: function (user, cb) {
    app.Event.find({invitedEmails: user.email}, function (err, events) {
      if (err) return cb(err);
      if (!events || events.length === 0) return cb();

      async.eachSeries(events, function (event, next) {
        event.invitedEmails.splice(event.invitedEmails.indexOf(user.email), 1);
        event.invitedUsers.push(user._id);
        event.save(next);
      }, function (err) {
        return cb(err);
      });
    });
  },

  getUserInvitedTo: function (startDate, stopDate, user, cb) {
    app.Event.find({
      $and: [
        {
          date: {$gte: startDate.toDate()}
        }, {
          date: {$lte: stopDate.toDate()}
        }, {
          invitedUsers: user._id
        }
      ]
    }, cb);
  },

  getUserAttendingOn: function (startDate, stopDate, user, cb) {
    app.Event.find({
      $and: [
        {
          date: {$gte: startDate.toDate()}
        }, {
          date: {$lte: stopDate.toDate()}
        }, {
          attendees: user._id
        }
      ]
    }, cb);
  },

  queryByUser: function (userId, offset, quantity, cb) {
    app.Event
      .find({date: {$gte: moment()}, $or: [{organizator: userId}, {invitedUsers: userId}, {attendees: userId}]})
      .sort({date: -1})
      .skip(offset * quantity)
      .limit(quantity)
      .populate('organizator', 'name desc email username provider gender picture')
      .exec(function (err, events) {
        if (err) return cb(err);
        var res = [];
        _.each(events, function (event) {
          var resEvent = event.toJSON();
          res.push(resEvent);
        });
        return cb(null, res);
      });
  },

  queryByDateRange: function (startDate, stopDate, user, cb) {
    var invitedToEvents = [];
    var attendingEvents = [];
    var resultingEventsList = [];

    async.series([
      function (next) {
        app.Event.getUserInvitedTo(startDate, stopDate, user, function (err, events) {
          if (err) return next(err);
          _.each(events, function (event) {
            invitedToEvents.push(event._id);
          });
          return next();
        });
      }, function (next) {
        app.Event.getUserAttendingOn(startDate, stopDate, user, function (err, events) {
          if (err) return next(err);
          _.each(events, function (event) {
            attendingEvents.push(event._id);
          });
          return next();
        });
      }, function (next) {
        var andStartDate = {
          date: {$gte: startDate.toDate()}
        };
        var andStopDate = {
          date: {$lte: stopDate.toDate()}
        };

        var publicEvents = {
          organizator: {$in: user.following},
          'permissions.visibility': 'public'
        };

        var followersEvents = {
          organizator: {$in: user.following},
          'permissions.visibility': 'followers'
        };

        var invitationsEvents = {
          _id: {$in: invitedToEvents}
        };

        var attendEvents = {
          _id: {$in: attendingEvents}
        };

        var myEvents = {
          organizator: user._id
        };

        var andPermissions = {
          $or: [
            myEvents,
            attendEvents,
            invitationsEvents,
            followersEvents,
            publicEvents
          ]
        };

        var query = {
          $and: [andStartDate, andStopDate, andPermissions]
        };
        app.Event
          .find(query)
          .populate('organizator', 'name desc email username provider gender picture')
          .exec(function (err, events) {
            if (err) return next(err);

            _.each(events, function (event) {
              var resEvent = event.toJSON();
              resultingEventsList.push(resEvent);
            });
            return next();
        });
      }
    ], function (err) {
      return cb(err, resultingEventsList);
    });
  },

  create: function (fields, creator, cb) {
    var permissions = {
      visibility: fields.visibility || visLevels[0],
      attendance: fields.attendance || visLevels[0]
    }

    delete fields.visibility;
    delete fields.attendance;
    fields.permissions = permissions;
    fields.date = moment(fields.date).utc();
    var event = new app.Event(fields);
    event.organizator = creator;
    event.save(cb);
  }
}
