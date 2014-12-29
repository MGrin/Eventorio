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
var troop = require('mongoose-troop');

/**
 * Models
 */
exports.initModel = function (myApp) {
  app = myApp;
};

var CommentSchema = exports.Schema = new Schema({
  content: String,
  creator: {
    type: ObjectId,
    ref: 'User'
  },
  event: {
    type: ObjectId,
    ref: 'Event'
  }
});

CommentSchema.statics = {
  create: function (user, eventId, content, cb) {
    var comment = new app.Comment({
      content: content,
      creator: user,
      event: eventId
    });

    comment.save(function (err, comment) {
      if (err) return cb(err);
      comment = comment.toObject();
      comment.creator = user.toJSON();
      return cb(null, comment);
    });
  },

  query: function (user, event, cb) {
    app.Comment
      .find({event: event.id})
      .sort({created: 1})
      .populate('creator')
      .exec(function (err, comments) {
        if (err) return cb (err);
        var result = [];

        _.each(comments, function (comment) {
          var commentJson = comment.toObject();
          commentJson.creator = comment.creator.toJSON();
          result.push(commentJson);
        });

        return cb(err, result);
      });
  }
};

CommentSchema.plugin(troop.timestamp, {
  useVirtual: false
});