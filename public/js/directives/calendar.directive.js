app.directive('calendar', ['$rootScope', 'Events', function ($rootScope, Events) {
  return {
    link: function ($scope, element, attrs) {
      $scope.month = moment();
      $(element).find('.responsive-calendar').responsiveCalendar({
        monthChangeAnimation: false,
        onDayClick: function (events) {
          var year = $(this).data('year');
          var month = ($(this).data('month') > 9) ? $(this).data('month') : '0' + $(this).data('month');
          var day = ($(this).data('day') > 9) ? $(this).data('day') : '0' + $(this).data('day');
          var dateStr = year + '-' + month + '-' + day;

          var date = moment(dateStr, 'YYYY-MM-DD');
          var events = events[dateStr] ? events[dateStr].dayEvents : [];

          return $rootScope.$broadcast('day', date, events);
        }
      });

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

      $scope.$on('monthlyEvents', $scope.updateCalendar);
    }
  }
}]);