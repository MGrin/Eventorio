app.controller('EventInviteController', ['$scope', 'Global', 'Notifications', 'Events',
  function ($scope, Global, Notifications, Events) {
  $scope.global = Global;
  $scope.followerQuery = '';

  $scope.$on('currentEvent', function () {
    $scope.event = $scope.$parent.event;
    $scope.uselessPeople = $scope.event.people.accepted.concat($scope.event.people.invited);

    $scope.followers = Global.me.followers;
    _.each($scope.followers, function (follower, index) {
      var find = _.find($scope.uselessPeople, function (us) {
        return us.id === follower.id
      });
      if (find) follower.active = false;
      else follower.active = true;
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

  $scope.inviteFollower = function (userId) {
    console.log(userId);
    if (!userId) return Notifications.error($('.invite-followers'), 'Empty user id');
    var user = _.find($scope.followers, function (us) {
      return us.id === userId;
    });
    if (!user) return Notifications.error($('.invite-followers'), 'Wrong user id');

    Events.inviteFollower(userId, $scope.event, function (err) {
      if (err) return Notifications.error($('.invite-followers'), err);

      $scope.event.people.invited.push(user);
      user.active = false;
    });
  };

  $scope.inviteByEmail = function () {
    $('#emailsToInvite').removeClass('has-error');

    var text = $('#emailsToInvite textarea').val();
    if (!text || text === '') {
      $('#emailsToInvite').addClass('has-error');
      Notifications.error($('#emailsToInvite'), 'Please enter at least one email');
      return;
    }

    text = text.replace(/\s/g, '');
    var emails = text.split(',');

    Events.inviteByEmail(emails, $scope.event, function (err) {
      if (err) return Notifications.error($('#emailsToInvite'), err);
      $('#emailsToInvite > input').val('');
    });
  };
}]);