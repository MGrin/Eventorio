'use strict';

/**
 * Module dependencies.
 */
var app; // all application-wide things like ENV, config, logger, etc
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var moment = require('moment');
var Schema = mongoose.Schema;
var _ = require('underscore');
var async = require('async');
var ObjectId = Schema.ObjectId;
var troop = require('mongoose-troop');

var actionTypes = {
  signup: 'signup',
  createEvent: 'create event',
  invite: 'invite',
  attendEvent: 'attend event',
  quitEvent: 'quit event',
  follow: 'follow'
};

/**
 * Models
 */
exports.initModel = function (myApp) {
  app = myApp;
};

var actorSchema = new Schema({
  _type: {
    type: String,
    enum: ['User', 'Event']
  }
});

var userActorSchema = actorSchema.extend({
  id: {
    type: ObjectId,
    ref: 'User'
  }
});

var eventActorSchema = actorSchema.extend({
  id: {
    type: ObjectId,
    ref: 'Event'
  }
});

var userActor = mongoose.model('UserActor', userActorSchema);
var eventActor = mongoose.model('EventActor', eventActorSchema);

var ActionSchema = exports.Schema = new Schema({
  _type: {
    type: String,
    enum: _.values(actionTypes)
  },
  object: [actorSchema], // on whom the action is performed
  subject: [actorSchema] // who is performing the action
});

ActionSchema.statics = {
  newSignupAction: function (user, cb) {
    if (!cb) cb = function (){};
    var subjectActor = new userActor({_type: 'User', id: user});
    var action = new app.Action({
      _type: actionTypes.signup,
      subject: [subjectActor]
    });
    return action.save(cb);
  },

  newCreateEventAction: function (event, cb) {
    if (!cb) cb = function (){};
    var objectActor = new eventActor({_type: 'Event', id: event});
    var subjectActor = new userActor({_type: 'User', id: event.organizator});
    var action = new app.Action({
      _type: actionTypes.createEvent,
      object: [objectActor],
      subject: [subjectActor]
    });
    return action.save(cb);
  },

  newAttendEventAction: function (user, event, cb) {
    if (!cb) cb = function (){};
    var subjectActor = new userActor({_type: 'User', id: user});
    var objectActor = new eventActor({_type: 'Event', id: event});
    var action = new app.Action({
      _type: actionTypes.attendEvent,
      object: [objectActor],
      subject: [subjectActor]
    });
    return action.save(cb);
  },

  newQuitEventAction: function (user, event, cb) {
    if (!cb) cb = function (){};
    var subjectActor = new userActor({_type: 'User', id: user});
    var objectActor = new eventActor({_type: 'Event', id: event});
    var action = new app.Action({
      _type: actionTypes.quitEvent,
      object: [objectActor],
      subject: [subjectActor]
    });
    return action.save(cb);
  },

  newInviteAction: function (user, event, cb) {
    if (!cb) cb = function (){};
    var objectActor = new userActor({_type: 'User', id: user});
    var subjectActor = new eventActor({_type: 'Event', id: event});
    var action = new app.Action({
      _type: actionTypes.invite,
      object: [objectActor],
      subject: [subjectActor]
    });
    return action.save(cb);
  },

  newFollowAction: function (user, follower, cb) {
    if (!cb) cb = function (){};
    var objectActor = new userActor({_type: 'User', id: follower});
    var subjectActor = new userActor({_type: 'User', id: user});
    var action = new app.Action({
      _type: actionTypes.follow,
      object: [objectActor],
      subject: [subjectActor]
    });
    return action.save(cb);
  }
};

ActionSchema.plugin(troop.timestamp, {
  useVirtual: false
});