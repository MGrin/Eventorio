app.factory('Events', ['$rootScope', '$resource', '$http', function ($rootScope, $resource, $http, Global) {
  'use strict';

  var event = $resource('/events/:eventId', {eventId: '@_id'}, {update: {method: 'POST'}});

  event.updateMonthlyList = function (date, cb) {
    var startDate = moment(date).subtract(1, 'month');
    startDate.set('date', 15);
    var stopDate = moment(date).add(1, 'month');
    stopDate.set('date', 15);

    $http.get('/events?startDate=' + startDate + '&stopDate=' + stopDate)
      .success(function (res) {
        $rootScope.$broadcast('monthlyEvents', res);
        if (cb) cb(null, res);
      }).error(function (res) {
        return cb(err);
      });
  }

  event.getUserEvents = function (user, offset, cb) {
    $http.get('/events?userId=' + user.id + '&offset=' + offset)
      .success(function (res) {
        return cb(null, res);
      }).error(function (res) {
        return cb(res);
      });
  }
  return event;
}]);
