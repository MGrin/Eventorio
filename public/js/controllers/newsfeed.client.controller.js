app.controller('NewsFeedController', ['$scope', 'Global', 'Users', function ($scope, Global, Users) {
  $scope.$on('me', function () {
    Users.getNews(function (err, actions) {
      if (err) return console.log(err);
      $scope.actions = actions;
      _.each($scope.actions, function (action) {
        action.readableTimestamp = moment(action.created).format('dddd, MMMM Do YYYY, h:mm:ss a');
      });
    });
  });
}]);