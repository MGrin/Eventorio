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
    .get(users.requiresLogin, users.show)
    .put(users.requiresLogin, users.update);
  app.param('username', users.loadByUsername);

  app.route('/events')
    .get(users.requiresLogin, events.query)
    .post(users.requiresLogin, events.create);
  app.route('/events/new')
    .get(users.requiresLogin, events.createPage);
  app.route('/events/:eventId')
    .get(users.requiresLogin, events.show)
    .post(users.requiresLogin, events.update);

  app.route('/api/follow')
    .post(users.requiresLogin, users.follow);
  app.route('/api/unfollow')
    .post(users.requiresLogin, users.unfollow);

  app.param('eventId', events.load);
};
