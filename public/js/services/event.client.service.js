app.factory('Events', ['$rootScope', '$resource', '$http', 'Global', function ($rootScope, $resource, $http, Global) {
  'use strict';

  var event = $resource('/events/:eventId',
                        {eventId: '@_id'},
                        {
                          update: {method: 'PUT'}
                        });

  event.updateMonthlyList = function (date, cb) {
    var startDate = moment(date).subtract(1, 'month');
    startDate.date(15);
    var stopDate = moment(date).add(1, 'month');
    stopDate.date(15);

    $http.get('/events?startDate=' + startDate + '&stopDate=' + stopDate)
      .success(function (res) {
        return cb(null, res);
      }).error(function (res) {
        return cb(res);
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

  event.remove = function(event, cb) {
    $http.delete('/events/' + event.id)
      .success(function () {
        return cb();
      }).error(function (response) {
        return cb(response);
      });
  };

  event.removeTemporaryEvent = function (event, cb) {
    if (!event.tempId || !(event.headerPicture || event.picture)) return cb();

    $http.delete('/events?tempId=' + event.tempId)
      .success(function () {
        return cb();
      }).error(function (response) {
        return cb(response);
      });
  };

  event.invite = function (emails, followers, event, cb) {
    $http.post('/events/' + event.id + '/invitations', {emails: emails, followers: followers})
      .success(function () {
        return cb();
      }).error(function (response) {
        return cb(response);
      });
  }

  event.participants = $resource('/events/:eventId/participants', {eventId: '@id', userId: "@userId"});

  event.participants.remove = function (event, cb) {
    $http.delete('/events/' + event.id + '/participants')
      .success(function () {
        return cb();
      }).error(function (response) {
        return cb(response);
      });
  };

  event.comments = $resource('/comments/:eventId',
                              {eventId: '@id'},
                              {
                                update: {method: 'POST'},
                                query: {method: 'GET', isArray: true}
                              });
  return event;
}]);
