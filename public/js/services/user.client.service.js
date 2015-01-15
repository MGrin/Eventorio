app.factory('Users', ['$resource', '$http', 'Global', function ($resource, $http, Global) {
  'use strict';

  var user = $resource('/users/:username', {username: '@_id'}, {update: {method: 'PUT'}});

  user.getCurrentUser = function (cb) {
    if (Global.me) return cb();

    $http.get('/users/me')
      .success(function (response) {
        Global.me = response;
        return cb();
      }).error(function (response){
        Global.me = undefined;
        return cb();
      });
  }

  user.getNews = function (offset, cb) {
    $http.get('/api/news?offset='+offset)
      .success(function (response) {
        return cb(null, response);
      }).error(function (response) {
        return cb(response);
      })
  }

  user.login = function (username, password, cb) {
    $http.post('/login', {username: username, password: password})
      .success(function (data, status, header, config) {
        return cb();
      }).error(function (data, status, header, config) {
        return cb(data);
      })
  }

  user.follow = function (userId, cb) {
    $http.post('/api/follow', {userId: userId})
      .success(function (response) {
        return cb();
      }).error(function (response) {
        return cb(response);
      })
  }

  user.unfollow = function (userId, cb) {
    $http.post('/api/unfollow', {userId: userId})
      .success(function (response) {
        return cb();
      }).error(function (response) {
        return cb(response);
      });
  }

  user.changePassword = function (credentials, cb) {
    $http.post('/changePassword', credentials)
      .success(function (response) {
        return cb();
      }).error(function (response) {
        return cb(response);
      });
  }

  return user;
}]);
