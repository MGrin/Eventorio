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
  },
  userId: {
    type: ObjectId,
    ref: 'User'
  },
  eventId: {
    type: ObjectId,
    ref: 'Event'
  }
});

var actor = mongoose.model('Actor', actorSchema);

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
    var subjectActor = new actor({_type: 'User', userId: user._id});
    var action = new app.Action({
      _type: actionTypes.signup,
      subject: [subjectActor]
    });
    return action.save(cb);
  },

  newCreateEventAction: function (event, cb) {
    if (!cb) cb = function (){};
    var objectActor = new actor({_type: 'Event', eventId: event});
    var subjectActor = new actor({_type: 'User', userId: event.organizator});
    var action = new app.Action({
      _type: actionTypes.createEvent,
      object: [objectActor],
      subject: [subjectActor]
    });
    return action.save(cb);
  },

  newAttendEventAction: function (user, event, cb) {
    if (!cb) cb = function (){};
    var subjectActor = new actor({_type: 'User', userId: user});
    var objectActor = new actor({_type: 'Event', eventId: event});
    var action = new app.Action({
      _type: actionTypes.attendEvent,
      object: [objectActor],
      subject: [subjectActor]
    });
    return action.save(cb);
  },

  newQuitEventAction: function (user, event, cb) {
    if (!cb) cb = function (){};
    var subjectActor = new actor({_type: 'User', userId: user});
    var objectActor = new actor({_type: 'Event', eventId: event});
    var action = new app.Action({
      _type: actionTypes.quitEvent,
      object: [objectActor],
      subject: [subjectActor]
    });
    return action.save(cb);
  },

  newInviteAction: function (actorUser, user, event, cb) {
    if (!cb) cb = function (){};
    var objectActor = new actor({_type: 'User', userId: user});
    var subjectActor = new actor({_type: 'Event', eventId: event, userId: actorUser});
    var action = new app.Action({
      _type: actionTypes.invite,
      object: [objectActor],
      subject: [subjectActor]
    });
    return action.save(cb);
  },

  newFollowAction: function (follower, user, cb) {
    if (!cb) cb = function (){};
    var objectActor = new actor({_type: 'User', userId: user});
    var subjectActor = new actor({_type: 'User', userId: follower});
    var action = new app.Action({
      _type: actionTypes.follow,
      object: [objectActor],
      subject: [subjectActor]
    });
    return action.save(cb);
  },

  actionsForUser: function (user, offset, quantity, cb) {
    app
      .Action
      .find({
        $or: [{
          'object.userId': user._id,
          'object._type': 'User'
        }, {
          'subject.userId': user._id,
          'subject._type': 'User'
        }]
      })
      .sort({created: -1})
      .skip(offset)
      .limit(quantity)
      .populate('object.userId object.eventId subject.userId subject.eventId')
      .exec(cb);
  }
};

ActionSchema.methods = {
  toJSON: function () {
    var res = this.toObject({virtuals: true});
    delete res.object;
    delete res.subject;
    delete res._id;
    delete res.__v;

    res.object = [];
    res.subject = [];

    _.each(this.object, function (actor) {
      var jsonActor = actor.toObject();
      delete jsonActor._id;

      if (actor.userId) jsonActor.userId = actor.userId.toJSON();
      if (actor.eventId) jsonActor.eventId = actor.eventId.toJSON();

      res.object.push(jsonActor);
    });

    _.each(this.subject, function (actor) {
      var jsonActor = actor.toObject();
      delete jsonActor._id;

      if (actor.userId) jsonActor.userId = actor.userId.toJSON();
      if (actor.eventId) jsonActor.eventId = actor.eventId.toJSON();
      res.subject.push(jsonActor);
    });

    return res;
  }
}
ActionSchema.plugin(troop.timestamp, {
  useVirtual: false
});