'use strict';

/**
 * Module dependencies.
 */
var app; // all application-wide things like ENV, config, logger, etc
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var textSearch = require('mongoose-text-search');
var moment = require('moment');
var _ = require('underscore');

/**
 * Models
 */
exports.initModel = function (myApp) {
  app = myApp;
};

var TicketTypeSchema = new Schema({
  name: String,
  price: Number,
  quantity: Number,
  purchased: {
    type: Number,
    default: 0
  }
});
/**
 * Events Schema
 */
var EventSchema = exports.Schema = new Schema({
  name: String,
  desc: String,
  venue: Object,
  organizator: {
    type: ObjectId,
    ref: 'User'
  },
  date: Date,
  tickets: [TicketTypeSchema]
});

EventSchema
  .virtual('id')
  .get(function () {
    return this._id.toString();
  });

EventSchema.index({ name: 'text', desc: 'text'});

EventSchema.methods = {
  modify: function (updates, user, cb) {
    if (this.organizator.id !== user.id) return cb(new Error('Not authorized'));

    updates = _.pick(updates, 'name', 'desc', 'date', 'picture', 'headerPicture', 'venue', 'tickets');

    var event = this;
    _.each(_.keys(updates), function (key) {
      event[key] = updates[key] || event[key];
    });
    event.save(cb);
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

  create: function (fields, creator, cb) {
    fields.date = moment(fields.date).utc(); //jshint ignore:line
    fields = _.pick(fields, 'name', 'desc', 'date', 'picture', 'headerPicture', 'venue', 'tickets'); // jshint ignore: line

    var event = new app.Event(fields);
    event.organizator = creator;

    event.save(function (err, savedEvent) {
      if (err) console.log(err);
      return cb(err, savedEvent);
    });
  }
};

EventSchema.plugin(textSearch);
