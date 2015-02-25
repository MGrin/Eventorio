app.controller('HeaderController', ['$scope', '$rootScope', '$location', 'Global', 'Users', 'Notifications',
  function ($scope, $rootScope, $location, Global, Users, Auth, Notifications) {
  $scope.global = Global;
  $scope.view = 'login';


  $scope.credentials = {
    username: '',
    email: '',
    password: '',
    repeatPassword: ''
  };
  $scope.switchView = function (view) {
    $scope.view = view;
  };

  $('#loginModal').on('hidden.bs.modal', function () {
    $scope.switchView('login');
    $scope.credentials = {
      username: '',
      email: '',
      password: '',
      repeatPassword: ''
    };
    $scope.$apply();
  });

  Users.getCurrentUser(function () {
    $scope.show = true;
    $rootScope.$broadcast('me');

    if (window.location.pathname === '/calendar' || window.location.pathname === '/app') $('#calendar-menu').addClass('active');
    if (window.location.pathname === '/news') $('#news-menu').addClass('active');
    if (Global.me && window.location.pathname === '/users/' +  Global.me.username) $('#profile-menu').addClass('active')
  });

  $scope.addErrorClass = function (name) {
    $('#login-box input[name="' + name + '"]').parent().addClass('has-error');
  };

  $scope.clearErrors = function () {
    _.each(_.keys($scope.credentials), function (field) {
      $('#login-box input[name="' + field + '"]').parent().removeClass('has-error');
    });
  }
  $scope.restorePassword = function () {
    $scope.clearErrors();
    if (!$scope.credentials.username) {
      Notifications.error($('#loginModal form'), 'Username should contain only letters or digits and have more than 4 characters');
      $scope.addErrorClass('username');
      return;
    }

    if (!$scope.credentials.email) {
      Notifications.error($('#loginModal form'), 'Email is required');
      $scope.addErrorClass('email');
      return;
    }
    Auth.restore($scope.credentials.username, $scope.credentials.email, function (err) {
      if (err) {
        Notifications.error($('#loginModal form'), err);
        return;
      }

      $('#loginModal').toggle();
      Notifications.info($('#header'), 'Email with new password was sent to you');
    });
  };

}]);