app.controller('HeaderController', ['$scope', '$rootScope', '$location', 'Global', 'Users', 'Auth',
  function ($scope, $rootScope, $location, Global, Users, Auth) {
  $scope.global = Global;

  Users.getCurrentUser(function () {
    $scope.show = true;
    $rootScope.$broadcast('me');

    if (window.location.pathname === '/calendar' || window.location.pathname === '/app') $('#calendar-menu').addClass('active');
    if (window.location.pathname === '/news') $('#news-menu').addClass('active');
    if (Global.me && window.location.pathname === '/users/' +  Global.me.username) $('#profile-menu').addClass('active')
  });

  $scope.restorePassword = function () {
    username = $('#login-box input[name="username"]').val() || '';
    email = $('#login-box input[name="email"]').val() || '';

    Auth.restore(username, email, function (err) {
      if (err) {
        $('#restoreButton').popover({
          content: err,
          trigger: 'manual',
          placement: 'left'
        });
        $('#restoreButton').popover('show');
        setTimeout(function () {
          $('#restoreButton').popover('destroy');
        }, 2000);
        return;
      }

      $('#loginModal').toggle();
      $('#header').noty({
        text: 'Email with new password was sent to you',
        type: 'information',
        layout: 'BottomLeft',
        timeout: 2000
      });
    });
  };

  $scope.login = function () {
    username = $('#login-box input[name="username"]').val() || '';
    password = $('#login-box input[name="password"]').val() || '';

    Auth.login(username, password, function (err) {
      if (err) {
        $('#loginButton').popover({
          content: err,
          trigger: 'manual',
          placement: 'left'
        });
        $('#loginButton').popover('show');
        setTimeout(function () {
          $('#loginButton').popover('destroy');
        }, 2000);
        return;
      }

      if (Global.screenSize === 'lg') window.location = '/app';
      else if (Global.screenSize === 'xs') window.location = '/calendar';
    });
  }
}]);