app.factory('Events', ['$rootScope', '$resource', '$http', 'Global', function ($rootScope, $resource, $http, Global) {
  'use strict';

  var event = $resource('/events/:eventId', {eventId: '@_id'}, {update: {method: 'POST'}});

  event.updateMonthlyList = function (date, cb) {
    var startDate = moment(date).subtract(1, 'month');
    startDate.date(15);
    var stopDate = moment(date).add(1, 'month');
    stopDate.date(15);

    $http.get('/events?startDate=' + startDate + '&stopDate=' + stopDate)
      .success(function (res) {
        $rootScope.$broadcast('monthlyEvents', res);
        return cb(null, res);
      }).error(function (res) {
        return cb(err);
      });
  };

  event.getUserEvents = function (user, offset, cb) {
    $http.get('/events?userId=' + user.id + '&offset=' + offset)
      .success(function (res) {
        return cb(null, res);
      }).error(function (res) {
        return cb(res);
      });
  };

  event.inviteByEmail = function (emails, event, cb) {
    $http.post('/events/' + event.id + '/invite', emails)
      .success(function (response) {
        return cb();
      }).error(function (response) {
        return cb(response);
      });
  };

  event.inviteFollower = function (userId, event, cb) {
    $http.post('/events/' + event.id + '/invite/' + userId)
      .success(function (response) {
        return cb();
      }).error(function (response) {
        return cb(response);
      });
  };

  event.attend = function (event, cb) {
    $http.post('/events/' + event.id + '/attend')
      .success(function (response) {
        return cb();
      }).error(function (response) {
        return cb(response);
      });
  };

  event.quit = function (event, cb) {
    $http.post('/events/' + event.id + '/quit')
      .success(function (response) {
        return cb();
      }).error(function (response) {
        return cb(response);
      });
  };

  event.remove = function(event, cb) {
    $http.delete('/events/' + event.id)
      .success(function () {
        return cb();
      }).error(function (response) {
        return cb(response);
      });
  };

  event.people = $resource('/events/:eventId/users', {eventId: '@_id'}, {update: {method: 'POST'}});

  return event;
}]);
