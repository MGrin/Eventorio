'use strict';

/**
 * Module dependencies.
 */
var app; // all application-wide things like ENV, config, logger, etc
var mongoose = require('mongoose');
var crypto = require('crypto');
var troop = require('mongoose-troop');
var Schema = mongoose.Schema;
var _ = require('underscore');
var async = require('async');
var ObjectId = Schema.ObjectId;

/**
 * Models
 */
exports.initModel = function (myApp) {
  app = myApp;
};

/**
 * User Schema
 */
var UserSchema = exports.Schema = new Schema({
  name: String,
  desc: String,
  email: String,
  username: String,
  provider: String,
  gender: String, // male or female

  hashPassword: String,
  salt: String,

  picture: String,       // picture uploaded by user
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function (password) {
    this.salt = this.makeSalt();
    this.hashPassword = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

UserSchema
  .virtual('virtualGravatar')
  .get(function () {
    return crypto.createHash('md5').update(this.email).digest('hex');
  });

UserSchema
  .virtual('id')
  .get(function () {
    return this._id.toString();
  });

UserSchema.index({name: 'text', username: 'text'}); // for fulltext search

/**
 * Validations
 */
var validatePresenceOf = function (value) {
  return value && value.length;
};

/**
 * Methods
 */
UserSchema.methods = {

  /**
   * Authenticate - check if the passwords are the same
   */
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashPassword;
  },

  /**
   * Make salt
   */
  makeSalt: function () {
    return String(Math.round((new Date().valueOf() * Math.random())));
  },

  /**
   * Encrypt password
   */
  encryptPassword: function (password) {
    if (!password) return '';
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
  },

  /**
   * Generate new password for user, update the user and return the new password
   *
   * @return {String} password
   */
  createNewPassword: function () {
    var p = lib.generatePassword(8);
    this.password = p;
    this.save(function () {});
    return p;
  },

  toJSON: function () {
    var res = this.toObject({virtuals: true});
    delete res._id;
    delete res.__v;
    delete res.modified;
    delete res.password;
    delete res.hashPassword;
    delete res.virtualGravatar;
    delete res.salt;
  }
};

UserSchema.statics = {
  create: function (fields, cb) {
    var email = fields.email;
    var username = fields.username;
    var password = fields.password;

    var savedUser;

    async.series([
      function (next) {
        app.User.count({email: email}, function (err, count) {
          if (err) return next(err);
          if (count > 0) return next(new Error('User with email \"' + email + '\" already registered!'));
          return next();
        });
      }, function (next) {
        app.User.count({username: username}, function (err, count) {
          if (err) return next(err);
          if (count > 0) return next(new Error('User with username \"' + username + '\" already registered.'));
          return next();
        });
      }, function (next) {
        var user = new app.User({
          username: username,
          email: email,
          name: fields.name,
          desc: fields.desc,
          gender: fields.gender
        });

        user.password = password;
        user.save(function (err, _savedUser) {
          savedUser = _savedUser;
          return next(err);
        });
      }
    ], function (err) {
      return cb(err, savedUser);
    });
  }
}
// Add joined and modified fields to the Schema
UserSchema.plugin(troop.timestamp, {
  useVirtual: false,
  createdPath: 'joined'
});
