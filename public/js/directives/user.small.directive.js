app.directive('userSmall', ['Global', function (Global) {
  return {
    scope: {
      user: '=user'
    },
    template: '<a><div class="row img img-circle" picture item-type="user" item="user" type="avatar"></div>' +
              '<div class="row"><div id="username" class="text-center"></div></div></a>',
    link: function ($scope, element, attrs) {
      $(element).find('a').attr('href', '/users/'+$scope.user.username);
      $(element).find('#username').text($scope.user.username);
    },
  }
}]);