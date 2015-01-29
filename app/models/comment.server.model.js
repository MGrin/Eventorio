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
var sanitizeHtml = require('sanitize-html');

var sanitizeConfig;

/**
 * Models
 */
exports.initModel = function (myApp) {
  app = myApp;
  sanitizeConfig = {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    allowedAttributes: {
      'a': ['href'],
      'img': ['src']
    }
  };
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
  create: function (author, eventId, content, cb) {
    content = sanitizeHtml(content, sanitizeConfig);

    if (!content) return cb(new Error('HTML comments are not allowed'));
    var comment = new app.Comment({
      content: content,
      creator: author,
      event: eventId
    });

    comment.save(function (err, comment) {
      if (err) cb(err);
      comment = comment.toObject();
      comment.creator = author.toJSON();
      cb(err, comment);
    });

    var words = content.split(' ');
    var references = [];
    var usernamesRE = [];

    _.each(words, function (word, index) {
      var regExpMatch = word.match(/@[a-zA-Z0-9]+/);
      if (regExpMatch) {
        var username = regExpMatch[0].substring(1);
        var usernameRE = new RegExp('^' + username +'$', 'i');
        references.push({
          word: word,
          index: index,
          username: username,
          usernameRE: usernameRE
        });
        usernamesRE.push(usernameRE);
      }
    });

    app.User.find({username: {$in: usernamesRE}}, function (err, users) {
      if (err) return next();

      _.each(users, function (user) {
        var usernameRE = new RegExp('^' + user.username +'$', 'i');

        var reference = _.find(references, function (reference) {
          return reference.username.match(usernameRE);
        });

        if (reference) app.Action.newReferencedAction(author, user, eventId);
      });
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