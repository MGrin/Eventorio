app.directive('userLine', ['Global', function (Global) {
  return {
    scope: {
      user: '=user'
    },
    template: '<div ng-show="isAlwaysVisible || user.isVisible" class="btn btn-flat btn-material-white">' +
                '<div class="row">' +
                  '<picture ng-show="!user.isChoosed" item-type="user" type="avatar" item="user" class="img col-lg-4 col-md-4 col-sm-4 col-xs-4"></picture>' +
                  '<span ng-show="user.isChoosed" class="mdi-action-done col-lg-4 col-md-4 col-sm-4 col-xs-4"></span>' +
                  '<span class="col-lg-8 col-md-8 col-sm-8 col-xs-8">{{user.username}}</span>' +
                '</div>' +
              '</div>',
    link: function ($scope, element, attrs) {
      $scope.isAlwaysVisible = attrs['alwaysVisible'];
      $scope.$watch('user.isChoosed', function (newVal) {
        if (newVal) $(element).css('opacity', 0.7);
        else $(element).css('opacity', 1);
      });
    },
  }
}]);