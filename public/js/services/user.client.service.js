app.factory('Users', ['$resource', '$http', 'Global', function ($resource, $http, Global) {
  'use strict';

  var user = $resource('/users/:username', {username: '@_id'}, {update: {method: 'POST'}});

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

  user.login = function (email, password, cb) {
    $http.post('/login', {username: email, password: password})
      .success(function (response) {
        return cb();
      }).error(function (response) {
        return cb(response);
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

  user.attend = function (event, cb) {
    $http.post('/api/attend/' + event.id)
      .success(function (response) {
        return cb();
      }).error(function (response) {
        return cb(response);
      })
  }

  user.quit = function (event, cb) {
    $http.post('/api/quit/' + event.id)
      .success(function (response) {
        return cb();
      }).error(function (response) {
        return cb(response);
      })
  }

  user.invite = function (emails, event, cb) {
    $http.post('/api/invite/' + event.id, emails)
      .success(function (response) {
        return cb();
      }).error(function (response) {
        return cb(response);
      })
  }

  return user;
}]);
