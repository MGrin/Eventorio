app.controller('ApplicationController', ['$rootScope', '$scope', 'Global', 'Events', function ($rootScope, $scope, Global, Events) {
  $scope.global = Global;
  $scope.now = moment();

  Events.updateMonthlyList($scope.now, function (err, events) {
    $rootScope.$broadcast('day', $scope.now, _.filter(events, function (event) {
      return moment(event.date).format('YYYYMMDD') === $scope.now.format('YYYYMMDD');
    }));
  });
  $scope.$on('day', function (info, date) {
    $('#createEventFloating').attr('href', '/events/new?d=' + date)
  });
}]);