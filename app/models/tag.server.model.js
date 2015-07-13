'use strict';

/**
 * Module dependencies.
 */
var app; // all application-wide things like ENV, config, logger, etc
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var troop = require('mongoose-troop');
var async = require('async');
var _ = require('underscore');
/**
 * Models
 */
exports.initModel = function (myApp) {
  app = myApp;
};

/**
 * Events Schema
 */
var TagSchema = exports.Schema = new Schema({
  value: String,
  count: Number,
  creator: {
    type: ObjectId,
    ref: 'User'
  }
});

TagSchema
  .virtual('id')
  .get(function () {
    return this._id.toString();
  });

TagSchema.index({ value: 'text', count: 'number'});

TagSchema.methods = {
  addCount: function () {
    this.count++;
    this.save(function (err) {
      if (err) app.err(err);
    });
  },

  toJSON: function () {
    return {
      text: this.value,
      weight: this.count
    };
  }
};

TagSchema.statics = {
  create: function (values, user, cb) {
    var tags;
    var newTags;

    async.series([
      function (next) {
        app.Tag.find({value: {$in: values}}, function (err, existingTags) {
          if (err) return next(err);

          tags = existingTags;
          newTags = _.filter(values, function (t) {
            return !_.find(tags, function (ta) {
              return ta.value === t;
            });
          });
          return next();
        });
      }, function (next) {
        async.each(newTags, function (value, nextEach) {
          var tag = new app.Tag({
            value: value,
            count: 0,
            creator: user
          });

          tag.save(function (err, savedTag) {
            if (err) return nextEach(err);
            tags.push(savedTag);
            return nextEach();
          });
        }, function (err) {
          return next(err, tags);
        });
      }
    ], function (err) {
      return cb(err, tags);
    });
  },


};

// Add joined and modified fields to the Schema
TagSchema.plugin(troop.timestamp, {
  useVirtual: false,
  createdPath: 'created'
});