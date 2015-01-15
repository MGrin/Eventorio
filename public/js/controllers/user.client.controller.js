app.controller('UserController', ['$scope', 'Global', 'Users', 'Events', 'Notifications',
  function ($scope, Global, Users, Events, Notifications) {
  $scope.global = Global;
  $scope.changePasswordView = false;

  $scope.$on('me', function () {
    $scope.user = Users.get({username: window.location.pathname.split('/')[2]}, function () {
      if (Global.me) {
        $scope.editable = (Global.me.username === $scope.user.username);
      } else {
        $scope.editable = false
      }
      $scope.userEventsOffset = 0;

      Events.getUserEvents($scope.user, 0, function (err, events) {
        if (err) return alert(err);
        $scope.user.events = events;
      });

      $scope.show = true;
    });
  });

  $scope.updateUser = function (field, value) {
    Global.me[field] = value;
    $scope.user[field] = value;
    Users.update({username: Global.me.username}, {name: field, value: value});
  };

  $scope.follow = function () {
    Users.follow($scope.user.id, function (err) {
      if (err) return alert(err);
      Global.me.following.push($scope.user);
      $scope.user.followers.push(Global.me);
    })
  }

  $scope.unfollow = function () {
    Users.unfollow($scope.user.id, function (err) {
      if (err) return alert(err);
      Global.me.following.splice(Global.me.following.indexOf($scope.user), 1);
      $scope.user.followers.splice($scope.user.followers.indexOf(Global.me), 1);
    })
  }

  $scope.credentials = {
    oldPassword: '',
    newPassword: '',
    newPasswordRepeat: ''
  }

  $scope.changePassword = function () {
    Users.changePassword($scope.credentials, function (err) {
      if (err) {
        return Notifications.error($('.changePasswordError'), err);
      }
      $scope.credentials = {
        oldPassword: '',
        newPassword: '',
        newPasswordRepeat: ''
      };

      Notifications.info($('.changePasswordError'), 'Password successfully changed!');
      $scope.changePasswordView = false;
    });
  }
}]);