app.controller('HeaderController', ['$scope', '$rootScope', '$location', 'Global', 'Users',
  function ($scope, $rootScope, $location, Global, Users) {
  $scope.global = Global;

  Users.getCurrentUser(function () {
    $scope.show = true;
    $rootScope.$broadcast('me');

    if (window.location.pathname === '/calendar' || window.location.pathname === '/app') $('#calendar-menu').addClass('active');
    if (window.location.pathname === '/news') $('#news-menu').addClass('active');
    if (Global.me && window.location.pathname === '/users/' +  Global.me.username) $('#profile-menu').addClass('active')
  });

  $scope.login = function () {
    var fields = {};
    var validData = true;

    $('#login-box').find('input').each(function (index) {
      var elem = this;
      if ($(elem).hasClass('hide')) return;

      var field = $(elem).attr('name');
      var val = $(elem).val();
      fields[field] = val;

      var fieldError = getErrorForField(field, val);
      if (fieldError) {
        validData = false;
        if (!$(elem).parent().hasClass('has-error')) {
          $(elem).parent().addClass('has-error');
        }
        $(this).popover({
          content: fieldError,
          trigger: 'manual'
        });
        $(this).popover('show');
      } else {
        if ($(elem).parent().hasClass('has-error')) {
          $(elem).parent().removeClass('has-error');
          $(this).popover('hide');
          $(this).popover('destroy');
        }
      }
    });

    if (validData) {
      Users.login(fields.username, fields.password, function (err) {
        if (err) {
          $('#loginButton').popover({
            content: err,
            trigger: 'manual',
            placement: 'left'
          });
          $('#loginButton').popover('show');
          setTimeout(function () {
            $('#loginButton').popover('hide');
          }, 2000);
          return;
        }
        if (Global.screenSize === 'lg') window.location = '/app';
        else if (Global.screenSize === 'xs') window.location = '/calendar'
      });
    }
  }

  $scope.restorePasswordModal = function () {
    $('#login-box').find('input').each(function () {
      if ($(this).attr('name') === 'password') $(this).addClass('hide');
      if ($(this).attr('name') === 'email') $(this).removeClass('hide');
    });
    $('#restoreButton').removeClass('hide');
    $('#loginButton').addClass('hide');
    $('#login-box').find('a').addClass('hide')
  };

  $scope.restore = function () {
    var fields = {};
    var validData = true;

    $('#login-box').find('input').each(function (index) {
      var elem = this;
      if ($(elem).hasClass('hide')) return;

      var field = $(elem).attr('name');
      var val = $(elem).val();
      fields[field] = val;

      var fieldError = getErrorForField(field, val);
      if (fieldError) {
        validData = false;
        if (!$(elem).parent().hasClass('has-error')) {
          $(elem).parent().addClass('has-error');
        }
        $(this).popover({
          content: fieldError,
          trigger: 'manual'
        });
        $(this).popover('show');
      } else {
        if ($(elem).parent().hasClass('has-error')) {
          $(elem).parent().removeClass('has-error');
          $(this).popover('hide');
          $(this).popover('destroy');
        }
      }
    });

    if (validData) {
      Users.restore(fields.username, fields.email, function (err) {
        if (err) {
          $('#restoreButton').popover({
            content: err,
            trigger: 'manual',
            placement: 'left'
          });
          $('#restoreButton').popover('show');
          setTimeout(function () {
            $('#restoreButton').popover('hide');
          }, 2000);
          return;
        }
        if (Global.screenSize === 'lg') window.location = '/app';
        else if (Global.screenSize === 'xs') window.location = '/calendar'
      });
    }
  };

  var getErrorForField = function (field, value) {
    if (!value || value === '') return 'Must not be empty!';

    return null;
  };
}]);