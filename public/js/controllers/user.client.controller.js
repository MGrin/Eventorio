'use strict';

app.controller('UserController', ['$scope', '$rootScope', 'Global', 'Users', 'growl', // jshint ignore:line
  function ($scope, $rootScope, Global, Users, growl) { // jshint ignore:line
  $scope.global = Global;
  $scope.changePasswordView = false;

  $scope.user = app.profile; // jshint ignore:line

  if (!Global.me) {
    $scope.editable = false;
  } else {
    if (Global.me.id === $scope.user.id) $scope.editable = true;
  }

  $scope.settings = {
    visible: {
      password: false
    }
  };

  $scope.credentials = {
    oldPassword: '',
    newPassword: '',
    newPasswordRepeat: ''
  };

  $scope.changePassword = function () {
    Users.changePassword(Global.me, $scope.credentials, function (err) {
      if (err) {
        $scope.credentials.error = err;
        return;
      }

      $scope.credentials = {
        oldPassword: '',
        newPassword: '',
        newPasswordRepeat: ''
      };
      delete $scope.credentials.error;
      $scope.credentials.passwordChanged = true;
      setTimeout(function () {
        $scope.credentials.passwordChanged = false;
        $scope.$apply();
      }, 3000);
      growl.info('Password successfully changed!');
    });
  };

  $scope.updateUser = function () {
    Users.update({_id: $scope.user.id, user: $scope.user}, function (user) {
      $scope.user = user;
    });
  };
}]);
