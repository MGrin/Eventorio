app.controller('UserController', ['$scope', 'Global', 'Users', function ($scope, Global, Users) {
  $scope.global = Global;

  Users.getCurrentUser(function () {
    $scope.user = Users.get({username: window.location.pathname.split('/')[2]}, function () {
      $scope.editable = (Global.me.username === $scope.user.username);
      $scope.setupEditable();
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

  // setTimeout($scope.setupEditable, 1000);
}]);