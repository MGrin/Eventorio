app.factory('Auth', ['$http', 'Users', function ($http, Users) {
  'use strict';

  var auth = {};

  auth.login = function (username, password, cb) {
    $http.post('/login', {username: username, password: password})
      .success(function (data, status, header, config) {
        return cb();
      }).error(function (data, status, header, config) {
        return cb(data);
      });
  };

  auth.restore = function (username, email, cb) {
    $http.post('/restorePassword', {username: username, email: email})
      .success(function (data, status, header, config) {
        return cb();
      }).error(function (data, status, header, config) {
        return cb(data);
      });
  };

  auth.signup = function (credentials, cb) {
    credentials.hashedPassword = credentials.password;
    delete credentials.password;
    delete credentials.repeatPassword;

    var user = new Users(credentials);
    user.$save(function (res) {
      return cb();
    }, function (res) {
      return cb(res.data);
    });
  }
  return auth;
}]);