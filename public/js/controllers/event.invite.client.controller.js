app.controller('EventInviteController', ['$scope', 'Global', 'growl', 'Events',
  function ($scope, Global, growl, Events) {
  $scope.global = Global;
  $scope.followerQuery = '';

  $scope.$on('currentEvent', function () {
    $scope.event = $scope.$parent.event;
    $scope.uselessPeople = $scope.event.people.accepted.concat($scope.event.people.invited);

    $scope.followers = Global.me.followers;
    $scope.canInviteFollowers = false;

    _.each($scope.followers, function (follower, index) {
      var find = _.find($scope.uselessPeople, function (us) {
        return us.id === follower.id
      });
      if (find) follower.active = false;
      else {
        follower.active = true;
        if (!$scope.canInviteFollowers) $scope.canInviteFollowers = true;
      }
    });
  });

  $scope.$on('me', function () {
    $scope.$watch('followerQuery', function (newVal, oldVal) {
      if (newVal === oldVal) return;
      var regexp = new RegExp(newVal, 'ig');

      $scope.followers = _.filter(Global.me.followers, function (follower) {
        var match = follower.username.match(regexp) || follower.email.match(regexp);
        if (follower.name) match = match || follower.name.match(regexp);
        return match;
      });
    });
  });

  $scope.checkIfCanInviteFollowers = function () {
    var find = _.find($scope.followers, function (follower) {
      return follower.active;
    });

    return find?true:false;
  };

  $scope.inviteAllFollowers = function () {
    Events.inviteAllFollowers($scope.event, function (err) {
      if (err) return growl.error(err);

      $scope.event.people.invited.concat(Global.me.followers);
      _.each($scope.followers, function (follower) {
        follower.active = false;
      });

      $scope.canInviteFollowers = false;
    });
  };

  $scope.inviteFollower = function (userId) {
    if (!userId) return growl.error('Empty user id');
    var user = _.find($scope.followers, function (us) {
      return us.id === userId;
    });
    if (!user) return growl.error('Wrong user id');

    Events.inviteFollower(userId, $scope.event, function (err) {
      if (err) return growl.error(err);

      $scope.event.people.invited.push(user);
      user.active = false;
      $scope.checkIfCanInviteFollowers();
    });
  };

  $scope.emails = '';

  $scope.inviteByEmail = function () {
    $('#emailsToInvite').removeClass('has-error');

    if (!$scope.emails || $scope.emails === '') {
      $('#emailsToInvite').addClass('has-error');
      growl.error('Please enter at least one email');
      return;
    }

    var text = $scope.emails;
    text = text.replace(/\s/g, '');
    var emailsArray = text.split(',');

    Events.inviteByEmail(emailsArray, $scope.event, function (err) {
      if (err) return growl.error(err);
      $scope.emails = '';
    });
  };
}]);