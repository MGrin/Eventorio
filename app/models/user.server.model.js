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
var randomstring = require('randomstring');

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
  }],

  activationCode: String,
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
    var p = generatePassword(8);
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
    delete res.activationCode;
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
      app.Action.newFollowAction(this, user);
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

  hasFollower: function (user) {
    return this.followers.indexOf(user._id) !== -1;
  },

  isFollowing: function (user) {
    return this.following.indexOf(user._id) !== -1;
  },

  acceptFollower: function (user, cb) {
    if (this.followers.indexOf(user._id) === -1) {
      this.followers.push(user._id);
      this.save(function (err, savedUser) {
        if (err) return app.err(err);
      });
    }
  },

  canAttend: function (event) {
    return event.organizator.id !== this.id && (event.permissions.attendance === 'public'
            || (event.permissions.attendance === 'followers' && this.isFollowing(event.organizator))
            || (event.permissions.attendance === 'invitations' && this.isInvitedTo(event)));
  },

  attendEvent: function (event, cb) {
    event.attendees.push(this._id);
    if (event.invitedUsers.indexOf(this._id) !== -1) {
      event.invitedUsers.splice(event.invitedUsers.indexOf(this._id), 1);
    }
    app.Action.newAttendEventAction(this, event);
    event.save(cb);
  },

  quitEvent: function (event, cb) {
    if (event.attendees.indexOf(this._id) !== -1) {
      event.attendees.splice(event.attendees.indexOf(this._id), 1);
    }
    if (event.invitedUsers.indexOf(this._id) === -1) {
      event.invitedUsers.push(this._id);
    }
    app.Action.newQuitEventAction(this, event);
    event.save(cb);
  },

  isInvitedTo: function (event) {
    return (event.invitedUsers.indexOf(this._id) !== -1) || (event.attendees.indexOf(this._id) !== -1);
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
        user.activationCode = randomstring.generate(10);

        user.save(function (err, _savedUser) {
          savedUser = _savedUser;
          return next(err);
        });
      }, function (next) {
        app.email.sendWelcomeMessage(savedUser);
        app.Action.newSignupAction(savedUser);
        app.Event.replaceInvitations(savedUser, next);
      }
    ], function (err) {
      return cb(err, savedUser);
    });
  },

  restorePassword: function (email, username, cb) {
    app.User.findOne({email: email}, function (err, user) {
      if (err) return cb(err);
      if (!user) return cb(new Error('Wrong email'));
      if (user.username !== username) return cb(new Error('Wrong email or username'));

      var newPassword = user.createNewPassword();
      app.email.sendRestorePassword(user, newPassword);
      return cb();
    })
  }
}
// Add joined and modified fields to the Schema
UserSchema.plugin(troop.timestamp, {
  useVirtual: false,
  createdPath: 'joined'
});

var generatePassword = function (length) {
  var password = '';
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  var size = chars.length;
  _.times(length, function () {
    // adds a random symbol to password
    password += chars[Math.floor(Math.random() * size)];
  });

  return password;
};
