app.controller('DaylyController', ['$scope', 'Global', 'Events', function ($scope, Global, Events) {

  var updateDayEvents = function () {
    $scope.dayEvents = [];
    var calendarDate = $scope.constructDateInCalendarFormat($scope.day);

    if ($scope.$parent.events[calendarDate]) {
      _.each($scope.$parent.events[calendarDate].dayEvents, function (event) {
        $scope.dayEvents.push(event);
      });
    }
  }

  $scope.global = Global;
  $scope.day = new Date();
  $scope.dayStr = $scope.day.getDate() + ' ' + Global.monthNames[$scope.day.getMonth()] + ' ' + $scope.day.getFullYear();
  $scope.dayEvents;

  $scope.$on('ChoosenDay', function (message) {
    $scope.day = message.targetScope.choosenDay;
    $scope.dayStr = $scope.day.getDate() + ' ' + Global.monthNames[$scope.day.getMonth()] + ' ' + $scope.day.getFullYear();

    updateDayEvents();

    $scope.$apply();
  });
}]);