'use strict';

app.factory('Users', ['$resource', '$http', 'Global', function ($resource, $http, Global) { // jshint ignore:line

  var user = $resource('/users/:user', {user: '@_id'}, {update: {method: 'PUT'}});

  user.changePassword = function (user, credentials, cb) {
    $http.post('/users/' + user.id + '/changePassword', credentials) // jshint ignore:line
      .success(function () {
        return cb();
      }).error(function (response) {
        return cb(response);
      });
  };

  return user;
}]);
