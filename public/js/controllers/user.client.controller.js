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
      password: false,
      additionalInfo: false
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

      $scope.settings.visibility.password = false;
      $scope.credentials = {
        oldPassword: '',
        newPassword: '',
        newPasswordRepeat: '',
        error: null
      };
      growl.info('Password successfully changed!');
    });
  };


  $scope.userBirthday = $scope.user.birthday ? new Date($scope.user.birthday) : new Date(1992, 0, 1);

  $scope.updateUserAdditionalInformation = function () {
    $scope.user.birthday = $scope.userBirthday; // jshint ignore:line
    $scope.updateUser();

    $scope.userBirthday = $scope.user.birthday;
    $scope.settings.visible.additionalInfo = false;
  };

  $scope.updateUser = function () {
    Users.update({_id: $scope.user.id, user: $scope.user}, function (user) {
      $scope.user = user;
    });
  };
}]);
