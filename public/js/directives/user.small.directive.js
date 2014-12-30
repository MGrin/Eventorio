app.directive('userSmall', ['Global', function (Global) {
  return {
    scope: {
      user: '=user'
    },
    template: '<a><div class="row"><img class="col-lg-12 col-xs-12 img img-responsive img-thumbnail"></div>' +
              '<div class="margin-lg-10"></div><div class="row"><label class="label label-default col-lg-10 col-lg-offset-1 col-xs-12 col-xs-offset-0"></label></div></a>',
    link: function ($scope, element, attrs) {
      $(element).find('a').attr('href', '/users/'+$scope.user.username);
      $(element).find('img').attr('src', $scope.user.picture);
      $(element).find('label').text($scope.user.username);
    },
  }
}]);