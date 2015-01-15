app.directive('calendar', ['$rootScope', 'Events', function ($rootScope, Events) {
  return {
    templateUrl: '/view/calendar.html',
    link: function ($scope, element, attrs) {
      $(element).find('.prevMonth').click($scope.prevMonth);
      $(element).find('.nextMonth').click($scope.nextMonth);

      Events.updateMonthlyList($scope.now, function () {});
      $(element).find('.responsive-calendar').responsiveCalendar({
        monthChangeAnimation: true,
        onDayClick: function (events) {
          var year = $(this).data('year');
          var month = ($(this).data('month') > 9) ? $(this).data('month') : '0' + $(this).data('month');
          var day = ($(this).data('day') > 9) ? $(this).data('day') : '0' + $(this).data('day');
          var dateStr = year + '-' + month + '-' + day;

          var date = moment(dateStr, 'YYYY-MM-DD');
          var events = events[dateStr] ? events[dateStr].dayEvents : [];

          $('.day').find('a').each(function () {
            $(this).css('background-color', 'transparent');
            $(this).hover(function () {
              $(this).css('background-color', '#eee');
            }, function () {
              $(this).css('background-color', 'transparent');
            });
          });
          $(this).css('background-color', '#6BB0BA');
          $(this).hover(function () {
            $(this).css('background-color', '#6BB0BA');
          });
          return $rootScope.$broadcast('day', date, events);
        }
      });
    }
  }
}]);