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
    app.User.find({}, function (err, users) {
      if (err) return next(err);
      async.each(users, function (user, nextUser) {
        user.pictureProvider = 'gravatar';
        user.save(function (err) {
          if (err) return app.err(err);
          return nextUser();
        });
      }, next);
    });
  }
], function (err) {
  if (err) console.error(err);
  else console.log('Done');
  process.exit();
});