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
var textSearch = require('mongoose-text-search');
var fs = require('fs-extra');
var randomstring = require('randomstring');

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
  venue: {
    geometry: {
      location: {
        D: Number,
        k: Number
      },
      viewport: {
        southwest: {
          lat: Number,
          lng: Number
        },
        northeast: {
          lat: Number,
          lng: Number
        }
      }
    },
    icon: String,
    website: String,
    id: String,
    place_id: String,
    types: [String]
  },
  organizator: {
    type: ObjectId,
    ref: 'User'
  },
  date: Date,
  picture: String,
  headerPicture: String,
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

EventSchema.index({ name: 'text', description: 'text'});

EventSchema.methods = {
  modify: function (updates, organizator, cb) {
    if (this.organizator.id !== organizator.id) return cb(new Error('Not authorized'));

    updates = _.pick(updates, 'name', 'desc', 'date', 'permissions', 'picture', 'headerPicture', 'venue');

    var event = this;
    async.series([
      function (next) {
        if (updates.headerPicture && updates.headerPicture !== event.headerPicture) {
          fs.unlink(app.config.pictures.event.pwd + event.id + '/header_' + event.headerPicture, function (err) {
            if (err) app.err(err);
            return next();
          });
        } else {
          next();
        }
      }, function (next) {
        if (updates.picture && event.picture && updates.picture !== event.picture) {
          fs.unlink(app.config.pictures.event.pwd + event.id + '/avatar_' + event.picture, function (err) {
            if (err) return cb(err);
            return next();
          });
        } else {
          next();
        }
      }, function (next) {
        _.each(_.keys(updates), function (key) {
          event[key] = updates[key] || event[key];
        });
        event.save(function (err, modifiedEvent) {
          if (err) return next(err);
          event = modifiedEvent;
          return next();
        });
      }
    ], function (err) {
      return cb(err, event);
    })
  },

  getPeople: function (cb) {
    var resultObject = {
      invited: [],
      accepted: [],
      emails: []
    };

    _.each(this.invitedEmails, function (email) {
      resultObject.emails.push(email);
    });

    var that = this;

    async.parallel([
      function (next) {
        app.User.find({_id: {$in: that.invitedUsers}}, function (err, invitedUsers) {
          if (err) return next(err);
          _.each(invitedUsers, function (user) {
            resultObject.invited.push(user.toJSON());
          });
          return next();
        });
      }, function (next) {
        app.User.find({_id: {$in: that.attendees}}, function (err, attendees) {
          if (err) return next(err);
          _.each(attendees, function (user) {
            resultObject.accepted.push(user.toJSON());
          });
          return next();
        });
      }
    ], function (err) {
      return cb(err, resultObject);
    });
  },

  removeEvent: function (organizator, cb) {
      if (this.organizator.id !== organizator.id) return cb(new Error('Not authorized'));
      var event = this;
      app.Action.removeEventActions(event, function(err){
        if(err) return cb(err);
        event.remove();
        return cb();
      });
  },

  canBeViewedBy: function (user) {
    if (!user) return this.permissions.visibility === 'public';
    return this.organizator.id === user.id
            || this.permissions.visibility === 'public'
            || (this.permissions.visibility === 'followers' && user.isFollowing(this.organizator))
            || (this.permissions.visibility === 'invitations' && user.isInvitedTo(this));
  },

  canBeAttendedBy: function (user) {
    if (!user) return false;
    return this.organizator.id !== user.id
            && ((this.permissions.attendance === 'public')
            || (this.permissions.attendance === 'followers' && user.isFollowing(this.organizator))
            || (this.permissions.attendance === 'invitations' && user.isInvitedTo(this)));
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
    delete resEvent.organizator.activationCode;
    delete resEvent.organizator.hashPassword;
    delete resEvent.organizator.salt;
    delete resEvent.invitedUsers;
    delete resEvent.invitedEmails;
    delete resEvent.attendees;
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

  loadEmptyEvent: function (creator, cb) {
    var tempId = randomstring.generate(20);
    var event = {
      tempId: tempId,
      permissions: {
        visibility: visLevels[0],
        attendance: visLevels[0]
      },
      organizator: creator.toJSON(),
      venue: {}
    };
    return cb(null, event);
  },

  replaceInvitations: function (user, cb) {
    app.Event.find({invitedEmails: user.email}, function (err, events) {
      if (err) return cb(err);
      if (!events || events.length === 0) return cb();

      var organizatorsToFollow = [];
      async.series([
        function (next) {
          async.eachSeries(events, function (event, nextEvent) {
            event.invitedEmails.splice(event.invitedEmails.indexOf(user.email), 1);
            event.invitedUsers.push(user._id);
            organizatorsToFollow.push(event.organizator);
            event.save(nextEvent);
          }, function (err) {
            return next(err);
          });
        },
        function (next) {
          app.User.find({_id: {$in: organizatorsToFollow}}, function (err, organizators){
            if (err) return next(err);
            _.each(organizators, function(organizator) {
              if(organizator.followers.length < app.config.constants.users.maxFollowerAutoFollow) {
                user.follow(organizator);
              }
            });
          });
          next();
        }
      ], function (err) {
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

  create: function (updates, creator, cb) {
    var tempId = updates.tempId;

    updates.date = moment(updates.date).utc();
    updates = _.pick(updates, 'name', 'desc', 'date', 'permissions', 'picture', 'headerPicture', 'venue');
    var event = new app.Event(updates);
    event.organizator = creator;

    var createdEvent;
    async.series([
      function (next) {
        event.save(function (err, savedEvent) {
          if (err) return next(err);
          createdEvent = savedEvent;
          return next();
        });
      }, function (next) {
        app.pictures.movePicturesForNewEvent(creator, createdEvent, tempId, function (err) {
          if (err) app.err(err);
          return next();
        });
      }, function (next) {
        creator.removeTemporaryEvent(tempId, next);
      }
    ], function (err) {
      if (!err) app.Action.newCreateEventAction(createdEvent);
      return cb(err, createdEvent);
    });
  },

}

EventSchema.plugin(textSearch);
