'use strict';

app.factory('Events', ['$rootScope', '$resource', '$http', 'Global', function ($rootScope, $resource, $http, Global) { // jshint ignore:line

  var event = $resource('/events/:event', {event: '@_id'},{update: {method: 'PUT'}});

  return event;
}]);
