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
var async = require('async');
var troop = require('mongoose-troop');

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
  headerPicture: String,

  tags: [{
    type: ObjectId,
    ref: 'Tag'
  }]
});

EventSchema
  .virtual('id')
  .get(function () {
    return this._id.toString();
  });

EventSchema.index({ name: 'text', desc: 'text'});

EventSchema.methods = {
  hasTag: function (tag) {
    var that = this;

    for (var i = 0; i < that.tags.length; i++) {
      console.log(that.tags[i].id, tag.id, that.tags[i].id === tag.id);
      if (that.tags[i].id === tag.id) return true;
    }
    return false;
  },

  modify: function (updates, user, cb) {
    if (this.organizator.id !== user.id) return cb(new Error('Not authorized'));
    
    var tags = _.map(updates.tags, function (tag) {
      return tag.text;
    });
    updates = _.pick(updates, 'name', 'desc', 'date', 'picture', 'headerPicture', 'venue', 'tickets', 'picture', 'headerPicture');

    var event = this;
    var modifiedEvent;

    async.series([
      function (next) {
        app.Tag.create(tags, user, function (err, createdTags) {
          if (err) return next(err);
          _.each(createdTags, function (tag) {
            if (!event.hasTag(tag)) tag.addCount();
          });
          event.tags = createdTags;
          return next();
        });
      },
      function (next) {
        _.each(_.keys(updates), function (key) {
          event[key] = updates[key] || event[key];
        });
        event.save(function (err, savedEvent) {
          if (err) return next(err);

          modifiedEvent = savedEvent;
          return next();
        });
      }
    ], function (err) {
      return cb(err, modifiedEvent);
    });
    
  },

  toJSON: function () {
    var tags = this.tags;
    var resEvent = this.toObject({virtuals: true});
    resEvent.tags = _.map(tags, function (tag) {
      return tag.toJSON();
    });
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
      .populate('organizator tags')
      .exec(cb);
  },

  create: function (fields, creator, cb) {
    fields.date = moment(fields.date).utc(); //jshint ignore:line
    fields = _.pick(fields, 'name', 'desc', 'date', 'picture', 'headerPicture', 'venue', 'tickets', 'picture', 'headerPicture'); // jshint ignore: line

    var createdEvent;
    var tags = _.map(fields.tags, function (tag) {
      return tag.text;
    });
    var createdTags;

    async.series([
      function (next) {
        app.Tag.create(tags, creator, function (err, _createdTags) {
          if (err) return next(err);
          createdTags = _createdTags;
          _.each(createdTags, function (tag) {
            tag.addCount();
          });
          return next();
        });
      }, function (next) {
        var event = new app.Event(fields);
        event.organizator = creator;
        event.tags = createdTags;

        event.save(function (err, savedEvent) {
          if (err) return next(err);
          createdEvent = savedEvent;
          return next();
        });
      }
    ], function (err) {
      return cb(err, createdEvent);
    });
    
  },

  query: function (params, cb) {
    var query = {};
    var limit = params.limit || 20;
    var offset = params.offset || 0;
    var sort = {created: -1};

    if (params.sortF) sort[params.sortF] = params.sortV || -1;

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

// Add joined and modified fields to the Schema
EventSchema.plugin(troop.timestamp, {
  useVirtual: false,
  createdPath: 'created'
});

EventSchema.plugin(textSearch);
