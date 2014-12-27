app.controller('LandingController', ['$scope', '$location', 'Global', 'Auth', 'Notifications',
  function ($scope, $location, Global, Auth, Notifications) {
  $scope.global = Global;
  $scope.credentials = {
    username: '',
    email: '',
    password: '',
    repeatPassword: ''
  };

  $scope.addErrorClass = function (name) {
    $('#signup-box input[name="' + name + '"]').parent().addClass('has-error');
  };

  $scope.clearErrors = function () {
    _.each(_.keys($scope.credentials), function (field) {
      $('#signup-box input[name="' + field + '"]').parent().removeClass('has-error');
    });
  };

  $scope.signup = function () {
    $scope.clearErrors();
    if (!$scope.credentials.username) {
      Notifications.error($('#signup-box form'), 'Username should contain only letters or digits and have more than 4 characters');
      $scope.addErrorClass('username');
      return;
    }

    if (!$scope.credentials.email) {
      Notifications.error($('#signup-box form'), 'Email is required');
      $scope.addErrorClass('email');
      return;
    }

    if (!$scope.credentials.password) {
      Notifications.error($('#signup-box form'), 'Wrong password');
      $scope.addErrorClass('password');
      return;
    }

    if (!$scope.credentials.repeatPassword && $scope.credentials.repeatPassword !== $scope.credentials.password) {
      Notifications.error($('#signup-box form'), 'Passwords are not equal');
      $scope.addErrorClass('repeatPassword');
      return;
    }

    Auth.signup($scope.credentials, function (err) {
      if (err) {
         Notifications.error($('#signup-box form'), err);
         return;
      }

      if (Global.screenSize === 'lg') window.location = '/app';
      else if (Global.screenSize === 'xs') window.location = '/calendar';
    })
  }
}]);