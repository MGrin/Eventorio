'use strict';
var fs = require('fs-extra');
var async = require('async');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var app;

module.exports = function (myApp) {
  app = myApp;

  app.pictures = {};

  app.pictures.removeTemporaryEvent = function (tempId, cb) {
    rimraf(app.config.pictures.event.pwd + tempId, cb);
  };

  app.pictures.movePicturesForNewEvent = function (creator, event, tempId, cb) {
    if (!event.headerPicture && !event.picture) return cb();

    var destinationFolder = app.config.pictures.event.pwd + event.id + '/';

    async.series([
      function (next) {
        mkdirp.mkdirp(destinationFolder, next);
      },
      function (next) {
        if (event.headerPicture) {
          fs.rename(app.config.pictures.event.pwd + tempId + '/header_' + event.headerPicture,
            destinationFolder + 'header_' + event.headerPicture, next);
        } else {
          return next();
        }
      },
      function (next) {
        if (event.picture) {
          fs.rename(app.config.pictures.event.pwd + tempId + '/avatar_' + event.picture,
            app.config.pictures.event.pwd + event.id + '/avatar_' + event.picture, next);
        } else {
          return next();
        }
      }, function (next) {
        creator.removeTemporaryEvent(tempId, next);
        rimraf(app.config.pictures.event.pwd + tempId, function (err) {
          if (err) return app.err(err);
        });
      }
    ], function (err) {
      return cb(err);
    });
  };
}