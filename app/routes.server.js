'use strict';

module.exports = function (app, passport) {
  var index = app.controllers.Index;
  var users = app.controllers.Users;
  var events = app.controllers.Events;

  app.route('/')
     .get(index.index);
  app.route('/app')
    .get(users.requiresLogin, index.app);

  /** User routes */
  app.route('/login')
    .post(users.login);
  app.route('/users')
    .post(users.signup);
  app.route('/logout')
    .get(users.logout);
  app.route('/users/:username')
    .get(users.requiresLogin, users.show);
  app.param('username', users.loadByUsername);

  app.route('/events')
    .get(users.requiresLogin, events.query)
    .post(users.requiresLogin, events.create);
  app.route('/events/:eventId')
    .get(users.requiresLogin, events.show);

  app.param('eventId', events.load);
};
