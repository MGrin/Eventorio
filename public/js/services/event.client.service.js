app.factory('Events', ['$rootScope', '$resource', '$http', function ($rootScope, $resource, $http, Global) {
  'use strict';

  var event = $resource('/events/:eventId', {eventId: '@_id'}, {update: {method: 'POST'}});

  event.getByMonth = function (month, year, cb) {
    $http.get('/events?month=' + month + '&year=' + year)
      .success(function (res) {
        return cb(null, res);
      }).error(function (res) {
        return cb(res);
      });
  }


  event.updateList = function (date, cb) {
    event.getByMonth(moment(date).get('month'), moment(date).get('year'), function (err, res) {
      if (err) return Global.showError(err);

      $rootScope.$broadcast('events', res);
      if (cb) cb(res);
    })
  }
  return event;
}]);
