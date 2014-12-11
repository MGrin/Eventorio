app.controller('NewsFeedController', ['$scope', 'Global', 'Users', function ($scope, Global, Users) {
  $scope.global = Global;

  $scope.offset = 0;

  $scope.$on('me', function () {
    Users.getNews($scope.offset, function (err, actions) {
      if (err) return Global.showError(err);
      $scope.actions = actions;
    });
  });

  $scope.loadMoreNews = function () {
    $scope.offset += 20;
    Users.getNews($scope.offset, function (err, actions) {
      if (err) return Global.showError(err);
      $scope.actions = $scope.actions.concat(actions);
    });
  }
}]);