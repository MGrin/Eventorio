app.factory('Auth', ['$http', function ($http) {
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
  return auth;
}]);