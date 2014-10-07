'use strict';

/**
 * Module dependencies.
 */
var app; // all application-wide things like ENV, config, logger, etc
var mongoose = require('mongoose');
var troop = require('mongoose-troop');
var Schema = mongoose.Schema;
var _ = require('underscore');
var async = require('async');
var ObjectId = Schema.ObjectId;

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
  picture: String,       // picture uploaded by user
});

EventSchema
  .virtual('id')
  .get(function () {
    return this._id.toString();
  });

EventSchema
  .virtual('day')
  .get(function () {
    return this.date.getDate();
  });

EventSchema
  .virtual('month')
  .get(function () {
    return this.date.getMonth();
  });

EventSchema
  .virtual('year')
  .get(function () {
    return this.date.getFullYear();
  });

EventSchema.methods = {
  toJSON: function () {
    var resEvent = this.toObject({virtuals: true});
    delete resEvent._id;
    delete resEvent.__v;
    delete resEvent.modified;
    delete resEvent.organizator._id;
    return resEvent;
  }
};

EventSchema.statics = {
  load: function (id, cb) {
    app.Event
      .findById(id)
      .populate('organizator', 'name desc email username provider gender picture')
      .exec(cb);
  },

  query: function (query, cb) {
    app.Event
      .find(query)
      .populate('organizator', 'name desc email username provider gender picture')
      .exec(function (err, events) {
        if (err) return cb(err);
        if (!events) return cb(err, []);

        var result = [];
        _.each(events, function (event) {
          var resEvent = event.toJSON();
          result.push(resEvent);
        });
        return cb(err, result);
    });
  },

  create: function (fields, creator, cb) {
    var event = new app.Event(fields);
    event.organizator = creator;
    event.save(cb);
  }
}

EventSchema.plugin(troop.timestamp, {
  useVirtual: false
});
