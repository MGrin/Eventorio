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
  tickets: [TicketTypeSchema],

  picture: String,
  headerPicture: String
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

    updates = _.pick(updates, 'name', 'desc', 'date', 'picture', 'headerPicture', 'venue', 'tickets', 'picture', 'headerPicture');

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
    delete resEvent.tickets;
    resEvent.organizator = this.organizator.toJSON();

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
    fields = _.pick(fields, 'name', 'desc', 'date', 'picture', 'headerPicture', 'venue', 'tickets', 'picture', 'headerPicture'); // jshint ignore: line

    var event = new app.Event(fields);
    event.organizator = creator;

    event.save(function (err, savedEvent) {
      if (err) console.log(err);
      return cb(err, savedEvent);
    });
  },

  query: function (params, cb) {
    var query = {};
    var limit = params.limit || 20;
    var offset = params.offset || 0;
    var sort = {created: -1};

    if (params.sortF) sort[params.sortF] = params.sortV || -1;

    if (!params.organizator && !params.participant) return cb(null, {organized: [], participated: []});
    if (params.organizator) query.organizator = params.organizator;
    if (params.participant) query.participant = params.participant;

    app.Event
      .find(query)
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .populate('organizator')
      .exec(function (err, events) {
        if (err) return cb(err);
        var res = {
          organized: [],
          participated: []
        };
        _.each(events, function (event) {
          if (event.organizator.id === query.organizator) return res.organized.push(event.toJSON());
          res.participated.push(event.toJSON());
        });

        return cb(null, res);
      });
  }
};

EventSchema.plugin(textSearch);
