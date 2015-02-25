'use strict';

module.exports = function (app, passport) {
  var index = app.controllers.Index;
  var users = app.controllers.Users;
  var events = app.controllers.Events;
  var comments = app.controllers.Comments;
  var search = app.controllers.Search;
  var pictures = app.controllers.Pictures;

  app.route('/')
     .get(index.index);
  app.route('/app')
    .get(users.requiresLogin, index.app);
  app.route('/calendar')
    .get(users.requiresLogin, index.calendar);
  app.route('/news')
    .get(users.requiresLogin, index.news);

  app.route('/policy')
    .get(index.policy);

  /** User routes */
  app.route('/login')
    .post(users.login);
  app.route('/restorePassword')
    .post(users.restorePassword);
  app.route('/changePassword')
    .post(users.requiresLogin, users.changePassword);
  app.route('/logout')
    .get(users.logout);

  app.route('/users')
    .get(users.requiresLogin, users.query)
    .post(users.signup);
  app.route('/users/:user')
    .get(users.show)
    .put(users.requiresLogin, users.update);
  app.route('/users/:user/followers')
    .get(users.requiresLogin, users.followers);
  app.route('/users/:user/pictures')
    .post(users.requiresLogin, pictures.uploadForUser);

  app.route('/activation/:activationCode')
    .get(users.activate);
  app.param('activationCode', users.loadByActivationCode);

  app.route('/events')
    .get(users.requiresLogin, events.query)
    .post(users.requiresLogin, events.create)
    .delete(users.requiresLogin, events.removeTemporaryEvent);
  app.route('/events/new')
    .get(users.requiresLogin, events.createPage);
  app.route('/events/:eventId')
    .get(events.isAccessible, events.show)
    .post(users.requiresLogin, events.update)
    .delete(users.requiresLogin, events.remove);
  app.route('/events/:eventId/pictures')
    .post(users.requiresLogin, pictures.uploadForEvent);
  app.route('/events/:eventId/users')
    .get(events.getParticipants);
  app.route('/events/:eventId/invite/:user')
    .post(users.requiresLogin, events.invite);
  app.route('/events/:eventId/invite')
    .post(users.requiresLogin, events.invite);
  app.route('/events/:eventId/attend')
    .post(users.requiresLogin, events.isAttandable, users.attend);
  app.route('/events/:eventId/quit')
    .post(users.requiresLogin, users.quit);



  app.route('/comments')
    .post(users.requiresLogin, comments.create);
  app.route('/comments/:eventId')
    .get(comments.query);

  app.route('/pictures/:pictureId')
    .post(users.requiresLogin, pictures.uploadForEvent);

  app.route('/api/follow')
    .post(users.requiresLogin, users.follow);
  app.route('/api/unfollow')
    .post(users.requiresLogin, users.unfollow);
  app.route('/api/news')
    .get(users.requiresLogin, users.news);
  app.route('/api/participants/:eventId')
    .get(events.getParticipants);

  app.param('eventId', events.load);
  app.param('user', users.loadUser);
  app.param('pictureId', pictures.loadTempPicture);
};
