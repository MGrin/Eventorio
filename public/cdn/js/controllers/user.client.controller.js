app.controller('UserController', ['$scope', 'Global', 'Users', 'Events', function ($scope, Global, Users, Events) {
  $scope.global = Global;

  Users.getCurrentUser(function () {
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
        $scope.showTab('#followersTab');
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

  $scope.showTab = function (tab) {
    $scope.tab = tab;
    $('td').removeClass('info');
    $(tab).addClass('info');
  }

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

  // setTimeout($scope.setupEditable, 1000);
}]);