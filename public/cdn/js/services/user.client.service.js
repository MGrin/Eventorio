app.factory('Users', ['$resource', function ($resource) {
  'use strict';

  var user = $resource('/users/:userId', {userId: '@_id'}, {update: {method: 'POST'}});

  return user;
}]);
