app.directive('userSmall', ['Global', function (Global) {
  return {
    scope: {
      user: '=user'
    },
    template: '<a><img class="img img-responsive img-thumbnail">' +
              '<div class="text-center"></a>',
    link: function ($scope, element, attrs) {
      $(element).find('a').attr('href', '/users/'+$scope.user.username);
      $(element).find('img').attr('src', $scope.user.picture);
      $(element).find('div').text($scope.user.username);
    },
  }
}]);