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

var ActionSchema = exports.Schema = new Schema({
  concerningUsers: [{
    type: ObjectId,
    ref: 'User'
  }],
  //lalala
  concerningEvents: [{
    type: ObjectId,
    ref: 'Event'
  }],
  message: String
});

ActionSchema.statics = {
  signup: function (user) {
    var action = new app.Action({
      concerningUsers: [user._id],
      message: 'Welcome to Eventorio!'
    });
    action.save(function (err) {
      if (err) return app.err(err);
    });
  },

  followship: function (user, follower) {
    var action = new app.Action({
      concerningUsers: [user._id, follower._id],
      message: '<a href="/users/' + follower.username + '">@' + follower.username + '</a>'
                + ' follows <a href="/users/' + user.username + '">@' + user.username +'</a>'
    });
    action.save(function (err) {
      if (err) return app.err(err);
    });
  },

  getUserNewsFeed: function (user, offset, quantity, cb) {
    app.Action
      .find({concerningUsers: user._id})
      .sort({created: -1})
      .skip(offset)
      .limit(quantity)
      .populate('concerningUsers', 'name id username email')
      .exec(function (err, news) {
        if (err) return cb(err);
        var res = [];
        _.each(news, function (action) {
          res.push(action.toObject({virtuals: true}));
        });
        return cb(null, res);
      });
  }
}
ActionSchema.plugin(troop.timestamp, {
  useVirtual: false
});