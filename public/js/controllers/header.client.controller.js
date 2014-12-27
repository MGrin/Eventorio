app.controller('HeaderController', ['$scope', '$rootScope', '$location', 'Global', 'Users', 'Auth', 'Notifications',
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

  $scope.login = function () {
    $scope.clearErrors();
    if (!$scope.credentials.username) {
      Notifications.error($('#loginModal form'), 'Wrong username');
      $scope.addErrorClass('username');
      return;
    }

    if (!$scope.credentials.password) {
      Notifications.error($('#loginModal form'), 'Wrong password');
      $scope.addErrorClass('password');
      return;
    }

    Auth.login($scope.credentials.username, $scope.credentials.password, function (err) {
      if (err) {
        Notifications.error($('#loginModal form'), err);
        return
      }

      if (Global.screenSize === 'lg') window.location = '/app';
      else if (Global.screenSize === 'xs') window.location = '/calendar';
    });
  };

  $scope.signup = function () {
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

    if (!$scope.credentials.password) {
      Notifications.error($('#loginModal form'), 'Wrong password');
      $scope.addErrorClass('password');
      return;
    }

    if (!$scope.credentials.repeatPassword && $scope.credentials.repeatPassword !== $scope.credentials.password) {
      Notifications.error($('#loginModal form'), 'Passwords are not equal');
      $scope.addErrorClass('repeatPassword');
      return;
    }

    Auth.signup($scope.credentials, function (err) {
      if (err) {
         Notifications.error($('#loginModal form'), err);
         return;
      }

      if (Global.screenSize === 'lg') window.location = '/app';
      else if (Global.screenSize === 'xs') window.location = '/calendar';
    });
  };
}]);