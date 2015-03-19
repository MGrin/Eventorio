'use strict';

var _ = require('underscore');
var async = require('async');
var mkdirp = require('mkdirp');
var fs = require('fs');
var formidable = require('formidable');
var crypto = require('crypto');
var moment = require('moment');
var app;
var Pictures;

exports.init = function (myApp) {
  app = myApp;
  Pictures = this;
};

var pictureFunctions = ['avatar', 'header'];

exports.upload = function (req, type, root, item, cb) {
  var filehash;
  var filepath;
  var uploadedFilePath;

  async.series([
    function (next) {
      mkdirp.mkdirp(root, next);
    },
    function (next) {
      var form = new formidable.IncomingForm();
      form.on('error', function (err) {
        return cb(err);
      });
      form.on('file', function(field, file){
        uploadedFilePath = file.path;
      });
      form.on('end', function () {
        return next();
      });

      form.uploadDir = root;
      form.keepExtensions = true;
      form.parse(req);
    },
    function (next) {
      app.lib.fileSHA1(uploadedFilePath, function (err, fileHash) {
        if (err) return next(err);
        filehash = fileHash;
        filepath = root + type + '_' + fileHash;
        fs.rename(uploadedFilePath, filepath, next);
      });
    }
  ], function (err) {
    return cb(err, filehash);
  });
};

exports.uploadForUser = function (req, res) {
  var user = req.user;
  var type = req.query.type;
  var pictureRoot = app.config.pictures.user.pwd + user.id + '/';

  Pictures.upload(req, type, pictureRoot, user, function (err, hash) {
    if (err) return app.err(err, res);
    switch (type) {
      case 'header': {
        if (user.headerPicture && hash !== user.headerPicture) {
          fs.unlink(pictureRoot + type + '_' + user.headerPicture, function (err) {
            return app.err(err);
          });
        }
        user.headerPicture = hash;
        user.save(function (err) {
          if (err) return app.err(err, res);
          return res.send(hash);
        });
        break;
      }

      default: {
        return app.err(new Error('No picture function provided'), err);
      }
    }
  });
};

exports.uploadForEvent = function (req, res) {
  var event = req.event;
  var type = req.query.type;

  var pictureRoot = app.config.pictures.event.pwd + event.id + '/';

  Pictures.upload(req, type, pictureRoot, event, function (err, hash) {
    if (err) return app.err(err, res);

    return res.send(hash);
  });
}

exports.loadTempPicture = function (req, res, next, tempId) {
  var user = req.user;
  user.addTemporaryEvent(tempId);
  req.event = {
    id: tempId
  };
  return next();
}