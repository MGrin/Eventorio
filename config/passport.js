/**
 * Manages authentication with facebook/google+/etc.
 */

'use strict';

/**
 * Module dependencies.
 */
var app;
var FacebookStrategy = require('passport-facebook').Strategy;

var createUser;
var createOrUpdateUser;
var updateUser;

module.exports = function (myApp, passport) {
  app = myApp;
  var config = app.config;

  // serialize sessions
  passport.serializeUser(function (user, cb) {
    cb(null, user.id);
  });

  passport.deserializeUser(function (id, cb) {
    app.User.findOne({_id: id}, function (err, user) {
      cb(err, user);
    });
  });

  /**
   * Facebook strategy
   *
   * app management: https://developers.facebook.com/apps/512860618825059/settings/
   * remove apps: https://www.facebook.com/settings?tab=applications
   */
  passport.use(new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL
  }, function (accessToken, refreshToken, profile, cb) {
    app.User.findOne({'facebook.id': profile.id}, function (err, user) {
      if (err) return app.err(err, cb);

      // user is successfully authenticated with facebook
      if (user) return cb(null, user);

      // convert facebook profile data into common Eventorio format
      // facebook sends locale as 'en-GB', we need only 'en'
      profile.language = profile._json.locale.substr(0, 2);
      // picture - https://graph.facebook.com/11223344/picture
      profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture';

      // first time login with facebook
      createOrUpdateUser('facebook', profile, cb);
    });
  }));
};

/**
 * Create or update user based on email received from third party
 *
 * 1. if user already registered with email, update his profile info
 *    based on third party profile (e.g., facebook, google, etc.)
 * 2. if user does not exist, create him from facebook, google profile data
 *
 * @param {String} provider of third party profile (facebook, google)
 * @param {Object} profile data received from provider
 * @param {Function} cb
 */
createOrUpdateUser = function (provider, profile, cb) {
  var email = profile.emails[0].value;

  app.User.findOne({email: email}, function (err, user) {
    if (err) return app.err(err, cb);

    if (user) {
      // user already registered with his email, add google account for him
      updateUser(provider, profile, user, cb);
    } else {
      // user does not exist, create him
      createUser(provider, profile, cb);
    }
  });
};

/**
 * Creates a new Eventorio user from facebook data
 *
 * @param {String} provider of third party profile (facebook, google)
 * @param {Object} profile data received from provider
 * @param {Function} cb
 */
createUser = function (provider, profile, cb) {
  var params = {
    name: profile.displayName,
    email: profile.emails[0].value,
    language: profile.language,
    provider: provider,
    gender: profile.gender,
    joined: new Date(),
    activationCode: null,
    firstName: profile.name.givenName,
    lastName: profile.name.familyName,
    picture: profile.picture
  };
  params[provider] = profile._json;

  var user = new app.User(params);
  user.save(function (err) {
    if (err) return app.err(err, cb);

    // generate random password for the user
    user.createNewPassword();
    cb(null, user);
  });
};

/**
 * Update a Eventorio user with facebook data
 *
 * @param {String} provider of third party profile (facebook, google)
 * @param {Object} profile data received from provider
 * @param {Object} user existing in Eventorio to be updated
 * @param {Function} cb
 */
updateUser = function (provider, profile, user, cb) {
  var params = {
    provider: provider,
    // check if there are some missing fields
    pictureUrl: user.picture || profile.picture,
    name: user.name || profile.displayName,
    language: user.language || profile.language,
    gender: user.language || profile.gender,
    firstName: user.firstName || profile.name.givenName,
    lastName: user.lastName || profile.name.familyName
  };
  params[provider] = profile._json;

  user.update(params, function (err) {
    if (err) return app.err(err, cb);

    user.save(function (err) {
      if (err) return app.err(err, cb);

      cb(null, user);
    });
  });
};
