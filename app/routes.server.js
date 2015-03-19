'use strict';

module.exports = function (app, passport) {
  var index = app.controllers.Index;
  var users = app.controllers.Users;
  var events = app.controllers.Events;
  var comments = app.controllers.Comments;
  var search = app.controllers.Search;
  var pictures = app.controllers.Pictures;

  require('../public/js/shared/routes.shared.js')(app);

  app.route(app.path.landing)
     .get(index.index);
  app.route(app.path.dashboard)
    .get(users.requiresLogin, index.dashboard);
  app.route(app.path.policy)
    .get(index.policy);

  /** User routes */
  app.route(app.path.login)
    .post(users.login);
  app.route(app.path.restorePassword)
    .post(users.restorePassword);
  app.route(app.path.changePassword)
    .post(users.requiresLogin, users.changePassword);
  app.route(app.path.logout)
    .get(users.logout);

  app.route('/auth/facebook')
    .get(passport.authenticate('facebook'));
  app.route('/auth/facebook/callback')
    .get(passport.authenticate('facebook', {successRedirect: app.path.dashboard,
                                            failureRedirect: app.path.landing}));

  app.route('/auth/google')
    .get(passport.authenticate('google',
      {scope: [
        'https://www.googleapis.com/auth/plus.login',
        'https://www.googleapis.com/auth/userinfo.email'
      ]}));
  app.route('/auth/google/callback')
    .get(passport.authenticate('google', {successRedirect: app.path.dashboard,
                                          failureRedirect: app.path.landing}));
  app.route('/users')
    .post(users.signup);
  app.route('/users/:user')
    .get(users.show)
    .put(users.requiresLogin, users.update);
  app.route('/users/:user/connections')
    .get(users.requiresLogin, users.connections)
    .post(users.requiresLogin, users.addFollower)
    .delete(users.requiresLogin, users.removeFollower);
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
    .put(users.requiresLogin, events.update)
    .delete(users.requiresLogin, events.remove);
  app.route('/events/:eventId/pictures')
    .post(users.requiresLogin, pictures.uploadForEvent);
  app.route('/events/:eventId/participants')
    .get(events.isAccessible, events.getParticipants)
    .post(users.requiresLogin, events.isAttandable, users.attend)
    .delete(users.requiresLogin, users.quit);
  app.route('/events/:eventId/invitations')
    .post(users.requiresLogin, events.invite)

  app.route('/comments')
    .post(users.requiresLogin, comments.create);
  app.route('/comments/:eventId')
    .get(comments.query);

  app.route('/pictures/:pictureId')
    .post(users.requiresLogin, pictures.uploadForEvent);

  app.route('/api/news')
    .get(users.requiresLogin, users.news);
  app.route('/api/participants/:eventId')
    .get(events.getParticipants);

  app.param('eventId', events.load);
  app.param('user', users.loadUser);
  app.param('pictureId', pictures.loadTempPicture);
};
