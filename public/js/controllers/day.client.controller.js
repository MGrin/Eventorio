app.controller('DaylyController', ['$scope', 'Global', 'Events', function ($scope, Global, Events) {
  $scope.global = Global;
  $scope.day = moment();
  $scope.dayStr = moment($scope.day).format('Do MMMM YYYY');
  $scope.events = [];

  $scope.$on('day', function (info, date, events) {
    $scope.day = moment(date);
    $scope.events = events;
    $scope.dayStr = moment($scope.day).format('Do MMMM YYYY');
    $scope.$apply();
  });

}]);