app.controller('ApplicationController', ['$rootScope', '$scope', 'Global', 'Events', function ($rootScope, $scope, Global, Events) {
  $scope.global = Global;
  $scope.now = moment();
  $scope.events = [];
  $scope.eventsView = false;

  Events.updateMonthlyList($scope.now, function (err, events) {
    if (err) return growl.error(err);
    $rootScope.$broadcast('monthlyEvents', events);
    $scope.events = _.filter(events, function (event) {
      return moment(event.date).format('YYYYMMDD') === $scope.now.format('YYYYMMDD');
    });
  });

  $scope.$on('day', function (info, date, events) {
    $scope.now = date;
    $scope.events = events;
    $('#createEventFloating').attr('href', '/events/new?d=' + date);
    $scope.eventsView = true;
    $scope.$apply();
  });

  var possibleUrlHashes = ['calendarView', 'newsView'];
  var hash = window.location.hash.substring(1);
  if (hash) window.location.hash = "";

  if (Global.screenSize === 'xs') {
    if (!hash || possibleUrlHashes.indexOf(hash) === -1 || hash === 'calendarView') {
      $scope.calendarView = true;
      $scope.newsView = false;
    } else if (hash === 'newsView') {
      $scope.calendarView = false;
      $scope.newsView = true;
    }
    $scope.$on('dashboard:view', function (info, view) {
      switch(view) {
        case 'calendarView': {
          $scope.calendarView = true;
          $scope.newsView = false;
          break;
        }
        case 'newsView': {
          $scope.calendarView = false;
          $scope.newsView = true;
          break;
        }
      }
    });
  }
}]);