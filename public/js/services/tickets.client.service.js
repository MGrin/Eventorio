'use strict';

app.factory('Tickets', ['$resource', '$http', 'Global', function ($resource, $http, Global) { // jshint ignore:line

  var ticket = {
    sendStripeToken: function (token, eventId, ticketId, cb) {
      $http.post('/events/' + eventId + '/stripe/' + ticketId, token)
        .success(function () {
          return cb();
        }).error(function (res) {
          return cb(res);
        });
    }
  };

  return ticket;
}]);
