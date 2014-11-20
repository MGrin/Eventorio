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
var gravatar = require('gravatar');

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

  following: [{
    type: ObjectId,
    ref: 'User'
  }],

  followers: [{
    type: ObjectId,
    ref: 'User'
  }]
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
  .virtual('id')
  .get(function () {
    return this._id.toString();
  });

UserSchema
  .virtual('picture')
  .get(function () {
    return gravatar.url(this.email, app.config.gravatar);
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
    delete res.salt;
    return res;
  },

  update: function (field, value, cb) {
    this[field] = value;
    return this.save(cb);
  },

  follow: function (user, cb) {
    if (this.following.indexOf(user._id) === -1) {
      this.following.push(user._id);
      this.save(cb);
      user.acceptFollower(this);
    } else {
      return cb(new Error('Already following'));
    }
  },

  unfollow: function (user, cb) {
    var index = this.following.indexOf(user._id);
    if (index !== -1) {
      this.following.splice(index, 1);
      this.save(cb);

      index = user.followers.indexOf(this._id);
      if (index !== -1) {
        user.followers.splice(index, 1);
        user.save(function (err) {
          if (err) app.err(err);
        });
      }
    } else {
      return cb(null, this);
    }
  },

  acceptFollower: function (user, cb) {
    if (this.followers.indexOf(user._id) === -1) {
      this.followers.push(user._id);
      this.save(function (err) {
        if (err) return app.err(err);
      });
    }
  }
};

UserSchema.statics = {
  loadByUsername: function (username, cb) {
    app.User.find({username: new RegExp('^' + decodeURI(username) +'$', 'i')})
      .populate('following followers')
      .exec(function (err, users) {
        if (err) return cb(err);
        if (!users || users.length === 0) return cb();
        if (users.length > 1) return cb(new Error('More than one user for following username: ' + username));

        return cb(null, users[0]);
      });
  },

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
        app.User.count({username: new RegExp('^' + username +'$', 'i')}, function (err, count) {
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
