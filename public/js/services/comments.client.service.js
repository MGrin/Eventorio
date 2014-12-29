app.factory('Comments', ['$resource', '$http', function ($resource, $http, Global) {
  'use strict';

  var comment = $resource('/comments/:eventId', {eventId: '@_id'}, {update: {method: 'POST'}});

  return comment;
}]);
