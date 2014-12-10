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
  attendEvent: 'attend event',
  invite: 'invite',
  beInvited: 'invited',
  quitEvent: 'quit event',
  modifyEventDate: 'modify event date',
  modifyEventName: 'modify event name',
  modifyEventLocation: 'modify event location'
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
    enum: 'User', 'Event'
  }
});

var userActor = actorSchema.extend({
  id: {
    type: ObjectId,
    ref: 'User'
  }
});

var eventActor = actorSchema.extend({
  id: {
    type: ObjectId,
    ref: 'Event'
  }
});

var ActionSchema = exports.Schema = new Schema({
  _type: {
    type: String,
    enum: _.values(actionTypes)
  }
  object: actorSchema, // on whom the action is performed
  subject: actorSchema, // who is performing the action
});

ActionSchema.statics = {

};

ActionSchema.plugin(troop.timestamp, {
  useVirtual: false
});