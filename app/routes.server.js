'use strict';

module.exports = function (app, passport) {
  var index = app.controllers.Index;
  var users = app.controllers.Users;
  var events = app.controllers.Events;
  var comments = app.controllers.Comments;

  app.route('/')
     .get(index.index);
  app.route('/app')
    .get(users.requiresLogin, index.app);
  app.route('/calendar')
    .get(users.requiresLogin, index.calendar);
  app.route('/news')
    .get(users.requiresLogin, index.news);

  /** User routes */
  app.route('/login')
    .post(users.login);
  app.route('/users')
    .post(users.signup);
  app.route('/logout')
    .get(users.logout);
  app.route('/users/:username')
    .get(users.show)
    .put(users.requiresLogin, users.update);
  app.route('/restorePassword')
    .post(users.restorePassword);
  app.route('/changePassword')
    .post(users.requiresLogin, users.changePassword);

  app.route('/activation/:activationCode')
    .get(users.activate);
  app.param('activationCode', users.loadByActivationCode);

  app.route('/events')
    .get(users.requiresLogin, events.query)
    .post(users.requiresLogin, events.create);
  app.route('/events/new')
    .get(users.requiresLogin, events.createPage);
  app.route('/events/:eventId')
    .get(events.isAccessible, events.show)
    .post(users.requiresLogin, events.update)
    .delete(users.requiresLogin, events.remove);
  app.route('/events/:eventId/people')
    .get(events.getParticipants);
  app.route('/events/:eventId/invite')
    .post(users.requiresLogin, events.invite);
  app.route('/events/:eventId/attend')
    .post(users.requiresLogin, events.isAttandable, users.attend);
  app.route('/events/:eventId/quit')
    .post(users.requiresLogin, users.quit);


  app.route('/comments')
    .post(users.requiresLogin, comments.create);
  app.route('/comments/:eventId')
    .get(users.requiresLogin, comments.query);

  app.route('/api/follow')
    .post(users.requiresLogin, users.follow);
  app.route('/api/unfollow')
    .post(users.requiresLogin, users.unfollow);
  app.route('/api/news')
    .get(users.requiresLogin, users.news);
  app.route('/api/participants/:eventId')
    .get(events.getParticipants);

  app.param('eventId', events.load);
  app.param('username', users.loadByUsername);
  app.param('userId', users.loadById);
};
