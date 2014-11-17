app.controller('CalendarController', ['$scope', 'Global', 'Events', function ($scope, Global, Events) {

  var getCurrentMonthName = function () {
    return Global.monthNames[$scope.month.getMonth()] + ' ' + $scope.month.getFullYear();
  }

  $scope.global = Global;
  $scope.month = $scope.today;
  $scope.monthStr = getCurrentMonthName();
  $scope.monthlyCalendarDOM;

  $scope.$on('Events', function (message) {
    var events = message.targetScope.events;
    $scope.monthlyCalendarDOM.responsiveCalendar('edit', events);
  });

  $scope.initMonthlyCalendar = function () {
    $scope.monthlyCalendarDOM = $(".responsive-calendar")
    $scope.monthlyCalendarDOM.responsiveCalendar({
      time: $scope.today.getFullYear() + '-' + ($scope.today.getMonth() + 1),
      allRows: false,
      events: $scope.$parent.events,
      monthChangeAnimation: false,
      onInit: function () {

      },
      onDayClick: $scope.$parent.onDayClick
    });
  }

  $scope.prevMonth = function () {
    $('.responsive-calendar').responsiveCalendar('prev');
    $scope.month.setMonth($scope.month.getMonth() - 1);
    $scope.monthStr = getCurrentMonthName();
  }

  $scope.nextMonth = function () {
    $('.responsive-calendar').responsiveCalendar('next');
    $scope.month.setMonth($scope.month.getMonth() + 1);
    $scope.monthStr = getCurrentMonthName();
  }
}]);