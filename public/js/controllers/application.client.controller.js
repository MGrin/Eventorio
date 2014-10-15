app.controller('ApplicationController', ['$scope', 'Global', 'Events', function ($scope, Global, Events) {
  $scope.global = Global;

  $scope.today = new Date();
  $scope.choosenDay;
  $scope.events = {};

  var constructEventsForCalendar = function (events) {
    var res = {};
    _.each(events, function (event) {
      event.date = new Date(event.date);
      var calendarDate = $scope.constructDateInCalendarFormat(event.date);

      if (!res[calendarDate]) {
        res[calendarDate] = {};
        res[calendarDate].dayEvents = [];
        res[calendarDate].number = 0;
        res[calendarDate].badgeClass = 'eventorio-badge';
      }

      res[calendarDate].number++;
      res[calendarDate].dayEvents.push({
        name: event.name,
        location: event.location,
        desc: event.desc,
        organizator: event.organizator,
        url: '/events/' + event.id
      });

    });

    return res;
  }

  $scope.onDayClick = function (events) {
    var date = $(this).attr('data-day');
    var month = $(this).attr('data-month');
    var year = $(this).attr('data-year');

    $scope.choosenDay.setDate(date);
    $scope.choosenDay.setMonth(month-1);
    $scope.choosenDay.setYear(year);

    $scope.$broadcast('ChoosenDay', $scope.choosenDay);
  };

  $scope.constructDateInCalendarFormat = function (date) {
    return date.getFullYear() + '-' +
          ((date.getMonth() < 9)?'0':'') + (date.getMonth() + 1) + '-' +
          ((date.getDate() < 10)?'0':'') + date.getDate()
  }

  $scope.downloadEventsForMonth = function(month, year) {
    Events.getByMonth(month, year, function (err, events) {
      if (err) return console.log(err);

      $scope.events = constructEventsForCalendar(events);

      $scope.$broadcast('Events', $scope.events);
      if (!$scope.choosenDay) {
        $scope.choosenDay = $scope.today;
      }
      $scope.$broadcast('ChoosenDay', $scope.today);
    });
  }

  $scope.downloadEventsForMonth($scope.today.getMonth(), $scope.today.getFullYear());
}]);