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
var textSearch = require('mongoose-text-search');

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

  hashPassword: {type: String, select: false},
  salt: {type: String, select: false},

  following: [{
    type: ObjectId,
    ref: 'User'
  }],

  followers: [{
    type: ObjectId,
    ref: 'User'
  }],

  activationCode: {type: String, select: false},
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
    var p = app.lib.generatePassword(8);
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

  canAttendEvent: function (event) {
    return event.organizator.id !== this.id && (event.permissions.attendance === 'public'
            || (event.permissions.attendance === 'followers' && this.isFollowing(event.organizator))
            || (event.permissions.attendance === 'invitations' && this.isInvitedTo(event)));
  },

  canViewEvent: function (event) {
    return this.id === event.organizator.id || (event.permissions.visibility === 'public'
        || (event.permissions.visibility === 'followers' && this.isFollowing(event.organizator))
        || (event.permissions.visibility === 'invitations' && this.isInvitedTo(event)));
  },

  attendEvent: function (event, cb) {
    if (event.attendees.indexOf(this._id) === -1) event.attendees.push(this._id);

    var index = event.invitedUsers.indexOf(this._id);
    app.logger.info(index);
    if (index !== -1) event.invitedUsers.splice(index, 1);

    app.Action.newAttendEventAction(this, event);
    event.save(cb);
  },

  quitEvent: function (event, cb) {
    if (event.invitedUsers.indexOf(this._id) === -1) event.invitedUsers.push(this._id);

    var index = event.attendees.indexOf(this._id);
    app.logger.info(JSON.stringify(event.toObject()));
    if (index !== -1) event.attendees.splice(index, 1);

    app.Action.newQuitEventAction(this, event);
    event.save(cb);
  },

  inviteToEventByEmailOrUsername: function (event, email, cb) {
    var usernameRE = new RegExp('^' + email + '$', 'i');
    var actor = this;
    app.User.findOne({$or: [{email: email}, {username: usernameRE}]}, function (err, user) {
      if (err) return cb(err);
      if (!user) {
        app.email.sendInvitationMail(actor, {email: email, username: email}, event);
        if (event.invitedEmails.indexOf(email) === -1) {
          event.invitedEmails.push(email);
          event.save();
        }
        return cb();
      } else {
        actor.inviteToEvent(event, user, cb);
      }
    });
  },

  inviteToEvent: function (event, user, cb) {
    app.email.sendInvitationMail(this, user, event);
    if (event.invitedUsers.indexOf(user._id) === -1 && event.attendees.indexOf(user._id) === -1) {
      app.Action.newInviteAction(this, user, event);
      event.invitedUsers.push(user._id);
      event.save();
    }
    return cb();
  },

  isInvitedTo: function (event) {
    return (event.invitedUsers.indexOf(this._id) !== -1) || (event.attendees.indexOf(this._id) !== -1);
  },

  changePassword: function (credentials, cb) {
    if (!credentials.oldPassword || !credentials.newPassword || !credentials.newPasswordRepeat) {
        return cb(new Error('Missing credentials'));
    }
    if (credentials.newPassword !== credentials.newPasswordRepeat || credentials.newPassword.length < 8 || !this.authenticate(credentials.oldPassword)) {
        return cb(new Error('Wrong credentials'))
    }

    this.password = credentials.newPassword;
    return this.save(cb);
  }
};

UserSchema.statics = {
  loadUser: function (username, cb) {
    var query;

    if (mongoose.Types.ObjectId.isValid(username)) query = {_id: username};
    else query = {username: new RegExp('^' + decodeURI(username) +'$', 'i')};

    app.User.find(query)
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

  restorePassword: function (username, email, cb) {
    var usernameRE = new RegExp('^' + username +'$', 'i');
    app.User.findOne({username: usernameRE}, function (err, user) {
      if (err) return cb(err);
      if (!user) return cb(new Error('No user found'));
      if (user.email !== email) return cb(new Error('Wrong email'));

      var newPassword = user.createNewPassword();
      app.email.sendNewPassword(user, newPassword);
      return cb();
    });
  },

  search: function(searchQuery, limit, cb) {
    app.User.textSearch(searchQuery, {limit: limit}, function(err, output){
        if (err) return cb(err);
        return cb(false, output.results.map(function (objWithScore){
            return objWithScore.obj;
        }));
    });
  }
}
// Add joined and modified fields to the Schema
UserSchema.plugin(troop.timestamp, {
  useVirtual: false,
  createdPath: 'joined'
});


UserSchema.plugin(textSearch);