app.controller('UserController', ['$scope', 'Global', 'Users', 'Events', 'Notifications',
  function ($scope, Global, Users, Events, Notifications) {
  $scope.global = Global;
  $scope.changePasswordView = false;

  $('.user-header ul').hover(function () {
    $(this).removeClass('hide');
  });

  $('.user-header').hover(function () {
    $('.user-header ul').removeClass('hide');
  }, function () {
    $('.user-header ul').addClass('hide');
  });

  $('.user-thumbnail ul').hover(function () {
    $(this).removeClass('hide');
  });

  $('.user-thumbnail img').hover(function () {
    $('.user-thumbnail ul').removeClass('hide');
  }, function () {
    $('.user-thumbnail ul').addClass('hide');
  });

  $scope.$watch('choosingCover', function (newVal) {
    if (newVal) $('#user-content').css('margin-top', 120);
    else $('#user-content').css('margin-top', 0);
  });

  $scope.$on('user:update:header', function (info, img) {
    $scope.user.headerPicture = img;
    $scope.$apply();
  });

  $scope.$on('me', function () {
    $scope.user = Users.get({username: window.location.pathname.split('/')[2]}, function () {
      if (Global.me) {
        $scope.editable = (Global.me.username === $scope.user.username);
      } else {
        $scope.editable = false
      }
      $scope.userEventsOffset = 0;
      var meInFollowersList = _.find($scope.user.followers, function (follower) {
        return follower.id === Global.me.id;
      });

      $scope.isFollowing = (meInFollowersList) ? true : false;

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

  $scope.follow = function () {
    Users.follow($scope.user.id, function (err) {
      if (err) return Notifications.error($('.user-thumbnail'), err);
      Global.me.following.push($scope.user);
      $scope.user.followers.push(Global.me);
      $scope.isFollowing = true;
    })
  }

  $scope.unfollow = function () {
    Users.unfollow($scope.user.id, function (err) {
      if (err) return Notifications.error($('.user-thumbnail'), err);
      Global.me.following.splice(Global.me.following.indexOf($scope.user), 1);
      $scope.user.followers.splice($scope.user.followers.indexOf(Global.me.id), 1);
      $scope.isFollowing = false;
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
  };

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
}]);