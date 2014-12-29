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
      setTimeout(function () {
        $scope.setupEditable();
      }, 1000);
      $scope.show = true;
    });
  });

  $scope.setupEditable = function () {
    $('.user-name .editable').editable({
      type: 'text',
      url: window.location.pathname,
      ajaxOptions: {
        type: 'PUT',
        dataType: 'json'
      },
      pk: '',
      mode: 'popup',
      name: 'name',
      title: 'Enter your name',
      showbuttons: 'right'
    });

    $('.user-description .editable').editable({
      type: 'textarea',
      url: window.location.pathname,
      ajaxOptions: {
        type: 'PUT',
        dataType: 'json'
      },
      pk: '',
      mode: 'popup',
      name: 'desc',
      title: 'Describe yourself',
      showbuttons: 'right'
    });
  };

  $scope.follow = function () {
    Users.follow($scope.user.id, function (err) {
      if (err) return alert(err);
      Global.me.following.push($scope.user.id);
      $scope.user.followers.push(Global.me.id);
    })
  }

  $scope.unfollow = function () {
    Users.unfollow($scope.user.id, function (err) {
      if (err) return alert(err);
      Global.me.following.splice(Global.me.following.indexOf($scope.user.id), 1);
      $scope.user.followers.splice($scope.user.followers.indexOf(Global.me.id), 1);
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
        return Notifications.error($('.changePasswordForm'), err);
      }
      $scope.credentials = {
        oldPassword: '',
        newPassword: '',
        newPasswordRepeat: ''
      };

      Notifications.info($('.changePasswordForm'), 'Password successfully changed!');
      $scope.changePasswordView = false;
    });
  }
}]);