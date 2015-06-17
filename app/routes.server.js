'use strict';

module.exports = function (app, passport) {
  var index = app.controllers.Index;
  var users = app.controllers.Users;
  var events = app.controllers.Events;

  var authWithRedirectURL = function (provider, params) {
    return function (req, res, next) {
      var redirectURL = req.query.redirect;
      if (redirectURL && redirectURL !== '/') params.state = redirectURL;

      passport.authenticate(provider, params)(req, res, next);
    };
  };

  var authCallbackWithRedirectUrl = function (provider, params) {
    return function (req, res, next) {
      var redirectURL = req.query.state;
      params.successRedirect = redirectURL;

      return passport.authenticate(provider, params, function (err, user) {
        if (err) return app.err(err, next);
        if (!user) return app.err('No user found', next);
        req.login(user, function (err) {
          if (err) return app.err(err, next);
          req.body.redirect = redirectURL;
          next();
        });
      })(req, res, next);
    };
  };

  app.route('/')
     .get(index.index);
  app.route('/policy')
    .get(index.policy);

  /** User routes */
  app.route('/login')
    .post(users.login);
  app.route('/restore')
    .post(users.restorePassword);
  app.route('/logout')
    .get(users.logout);

  app.route('/users')
    .get(users.query)
    .post(users.signup);

  app.get('/auth/facebook',
    authWithRedirectURL('facebook', {
      scope: ['email', 'public_profile'],
      failureRedirect: '/'
    }), users.login);

  app.get('/auth/facebook/callback',
    authCallbackWithRedirectUrl('facebook', {
      failureRedirect: '/'
    }), users.login);

  app.get('/auth/google',
    authWithRedirectURL('google', {
      failureRedirect: '/',
      scope: 'https://www.googleapis.com/auth/userinfo.email' + ' ' +
        'https://www.googleapis.com/auth/userinfo.profile'
    }), users.login);

  app.get('/auth/google/callback',
    authCallbackWithRedirectUrl('google', {
      failureRedirect: '/',
      scope: 'https://www.googleapis.com/auth/userinfo.email' + ' ' +
        'https://www.googleapis.com/auth/userinfo.profile'
    }), users.login);

  app.route('/users/:userId')
    .get(users.show)
    .put(users.requiresLogin, users.update);

  app.route('/users/:userId/changePassword')
    .post(users.requiresLogin, users.changePassword);

  /** Events routes **/
  app.route('/events/create')
    .get(users.requiresLogin, users.requiresCompleteProfile, events.showCreationPage);

  app.route('/events')
    .get(events.query)
    .post(users.requiresLogin, users.requiresCompleteProfile, events.create);
  app.route('/events/:eventId')
    .get(events.show)
    .put(events.update);

  /** Parameters **/
  app.param('userId', users.load);
  app.param('eventId', events.load);
};
