app.controller('HeaderController', ['$scope', '$rootScope', 'Global', 'Users',
  function ($scope, $rootScope, Global, Users) {
    $scope.global = Global;
    Users.getCurrentUser(function () {
      $rootScope.$broadcast('me');
    });

    $scope.switchView = function (newView) {
      if (window.location.pathname === app.path.dashboard) {
        $rootScope.$broadcast('dashboard:view', newView);
        $('.navbar-toggle').click();
        return;
      }

      return window.location.href = app.path.dashboard + '#' + newView;
    }
}]);