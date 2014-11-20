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
    var permissions = {
      visibility: fields.visibility || visLevels[0],
      attendance: fields.attendance || visLevels[0]
    }

    delete fields.visibility;
    delete fields.attendance;
    fields.permissions = permissions;

    var event = new app.Event(fields);
    event.organizator = creator;
    event.save(cb);
  }
}
