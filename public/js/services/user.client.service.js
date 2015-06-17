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

  user.queryEvents = function (query, cb) {
    var href = '/events?';
    if (query.organizator) href += 'organizator=' + query.organizator + '&';
    if (query.participant) href += 'participant=' + query.participant + '&';
    if (query.limit) href += 'limit=' + query.limit + '&';
    if (query.sortF && query.sortV) href += 'sortF=' + query.sortF + '&sortV=' + query.sortV + '&';
    if (query.offset) href += 'offset=' + query.offset;

    $http.get(href)
      .success(function (events) {
        return cb(null, events[0]);
      }).error(function (response) {
        return cb(response);
      });
  };

  return user;
}]);
