app.directive('calendar', ['$rootScope', function ($rootScope) {
  return {
    templateUrl: '/view/calendar.html',
    link: function ($scope, element, attrs) {
      $(element).find('.prevMonth').click($scope.prevMonth);
      $(element).find('.nextMonth').click($scope.nextMonth);
      $(element).find('.responsive-calendar').responsiveCalendar({
        monthChangeAnimation: false,
        onDayClick: function (events) {
          var dateStr = $(this).data('year') + '-' + $(this).data('month') + '-' + $(this).data('day');

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