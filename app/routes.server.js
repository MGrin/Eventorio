'use strict';

module.exports = function (app, passport) {
  var index = app.controllers.Index;
  var users = app.controllers.Users;
  var eventorio = app.controllers.Eventorio;

  app.route('/')
     .get(index.index);

  /** User routes */
  app.route('/users')
    .post(users.signup);
  app.route('/login')
    .post(users.login);

};
