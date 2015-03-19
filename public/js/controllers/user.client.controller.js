app.controller('UserController', ['$scope', '$rootScope', 'Global', 'Users', 'Events', 'Pictures', 'growl',
  function ($scope, $rootScope, Global, Users, Events, Pictures, growl) {
  $scope.global = Global;
  $scope.changePasswordView = false;
  $scope.choosingCover = false
  var username = decodeURI(window.location.pathname.split('/')[2]);
  $scope.states = {
    me: false,
    profile: false,
    isFollower: false,
    events: false,
    connections: false
  };

  async.series([
    function (next) {
      $scope.$on('me', function () {
        if (!Global.me) {
          $scope.editable = false;
        } else if (Global.me.username === username) {
          $scope.editable = true;
          $scope.user = Global.me
          $scope.states.profile = true;
        } else {
          $scope.editable = false;
        }
        $scope.states.me = true;
        return next();
      });
    }, function (next) {
      if ($scope.user) return next();
      $scope.user = Users.get({user: username}, function () {
        $scope.states.profile = true;
        return next();
      });
    }, function (next) {
      if ($scope.editable) return next();
      var meInFollowersList = _.find($scope.user.followers, function (follower) {
        return follower.id === Global.me.id;
      });
      $scope.user.isFollower = (meInFollowersList) ? true : false;
      $scope.states.isFollower = true;
      return next();
    }, function (next) {
      Events.getUserEvents($scope.user, 0, function (err, events) {
        if (err) return next(err);
        $scope.user.events = events;
        $scope.events = true;
        return next();
      });
    }, function (next) {
      Users.getConnections($scope.user, function (err, connections) {
        $scope.user.followers = connections.followers;
        $scope.user.following = connections.following;
        $scope.states.connections = true;
        return next();
      });
    }
  ], function (err) {
    console.log($scope.user);
    if (err) growl.error(err);
  });

  $scope.follow = function () {
    Users.follow($scope.user.id, function (err) {
      if (err) return growl.error(err);
      Global.me.following.push($scope.user);
      $scope.user.followers.push(Global.me);
      $scope.user.isFollower = true;
    })
  }

  $scope.unfollow = function () {
    Users.unfollow($scope.user.id, function (err) {
      if (err) return growl.error(err);
      Global.me.following.splice(Global.me.following.indexOf($scope.user), 1);
      $scope.user.followers.splice($scope.user.followers.indexOf(Global.me.id), 1);
      $scope.user.isFollower = false;
    })
  }

  $scope.credentials = {
    oldPassword: '',
    newPassword: '',
    newPasswordRepeat: ''
  }

  $scope.changePassword = function () {
    Users.changePassword($scope.credentials, function (err) {
      if (err) return $scope.credentials.error = err;

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

  $scope.toggleCoverChoser = function () {
    $scope.choosingCover = !$scope.choosingCover;
    $scope.newHeaderPicture = null;
    $scope.headerUploadError = null;
    $scope.headerIsUploading = false;
  };

  $scope.saveNewCover = function () {
    $scope.headerIsUploading = true;
    Pictures.uploadHeaderForUser($scope.newHeaderPicture, $scope.user, function (err, img) {
      if (err) return growl.error(err);
      $scope.user.headerPicture = img;
      $scope.toggleCoverChoser();
      $scope.$apply();
    });
  }
}]);