'use strict';

var fs = require('fs');
var rimraf = require('rimraf');
var async = require('async');
var _ = require('underscore');
var mongoose = require('mongoose');
var boot = require('../lib/boot');
var inflection = require('inflection');

var app = {};
app.config = require('../config/config.server');
require('../lib/pictures')(app);

async.series([
  function (next) {
    // Bootstrap MongoDB connection
    mongoose.connection.on('error', function (err) {
      next(new Error('MongoDB connection error: \n' + err.message));
    });
    mongoose.connection.on('open', function () {
      console.log('MongoDB connection established');
      next();
    });
    mongoose.connect(app.config.db);
  }, function (next) {
    // Bootstrap models
    boot.initModels(app);
    console.log('Models loaded');
    next();
  }, function (next) {
    var limit = Date.now() - app.config.constants.pictures.timeout;
    app.User.find({'tempEvents.created': {$lte: limit}}, function (err, users) {
      if (err) return next(err);

      var parallelTasks = [];
      _.each(users, function (user) {
        parallelTasks.push(function (next) {
          var events = user.tempEvents;
          _.each(events, function (event) {
            if (event.created <= limit) {
              app.pictures.removeTemporaryEvent(event.id, function (err) {
                if (err) console.log('Temp id ' + event.id + ': ' + err);
                user.removeTemporaryEvent(event.id, function (err) {
                  if (err) console.log('Temp id ' + event.id + ': ' + err);
                  return next();
                });
              });
            }
          });
        });
      });
      async.parallel(parallelTasks, function (err) {
        return next(err);
      });
    });
  }
], function (err) {
  if (err) console.error(err);
  else console.log('Done');
  process.exit();
});