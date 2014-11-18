app.controller('HeaderController', ['$scope', '$location', 'Global', 'Users', function ($scope, $location, Global, Users) {
  $scope.global = Global;

  Users.getCurrentUser(function () {});

  $scope.login = function () {
    var fields = {};
    var validData = true;

    $('#login-box').find('input').each(function (index) {
      var elem = this;

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
        window.location = '/app';
      });
    }
  }

  var getErrorForField = function (field, value) {
    if (!value || value === '') return 'Must not be empty!';

    return null;
  }
}]);