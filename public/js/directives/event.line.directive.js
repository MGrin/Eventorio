app.directive('eventLine', ['Global', function (Global) {
  return {
    scope: {
      event: '=event'
    },
    templateUrl: '/view/eventLine.html',
    link: function ($scope, element, attrs) {
      $scope.event.date = moment($scope.event.date);
    },
  }
}]);