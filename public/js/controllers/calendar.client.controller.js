app.controller('CalendarController', ['$rootScope', '$scope', 'Global', 'Events', function ($rootScope, $scope, Global, Events) {
  $scope.global = Global;
  $scope.month = moment();

  $scope.updateCalendar = function (info, events) {
    var calendarEvents = {};

    _.each(events, function (event) {
      var calendarDate = moment(event.date).format('YYYY-MM-DD');
      if (!calendarEvents[calendarDate]) {
        calendarEvents[calendarDate] = {
          number: 0,
          dayEvents: []
        };
      }
      calendarEvents[calendarDate].number++;
      calendarEvents[calendarDate].dayEvents.push(event);
    });
    $('.responsive-calendar').responsiveCalendar('edit', calendarEvents);
  };

  $scope.prevMonth = function () {
    $scope.month.subtract(1, 'month');
    Events.updateMonthlyList($scope.month, function () {
      $('.responsive-calendar').responsiveCalendar('prev');
    });
  };

  $scope.nextMonth = function () {
    $scope.month.add(1, 'month');
    Events.updateMonthlyList($scope.month, function () {
      $('.responsive-calendar').responsiveCalendar('next');
    });
  };

  $scope.$on('monthlyEvents', $scope.updateCalendar);
}]);