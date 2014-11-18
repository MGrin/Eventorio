app.controller('LandingController', ['$scope', '$location', 'Global', 'Users', function ($scope, $location, Global, Users) {
  $scope.global = Global;

  $scope.signup = function () {
    var fields = {};
    var validData = true;

    $('#signup-box .jumbotron').find('input').each(function (index) {
      var elem = this;

      var field = $(elem).attr('name');
      var val = $(elem).val();
      fields[field] = val;

      var fieldError = getErrorForField(field, val)
      if (fieldError) {
        validData = false;
        if (!$(elem).parent().hasClass('has-error')) {
          $(elem).parent().addClass('has-error');
        }
        $(this).popover({
          content: fieldError,
          placement: 'left',
          trigger: 'manual'
        });
        $(this).popover('show');
      } else {
        if ($(elem).parent().hasClass('has-error')) {
          $(elem).parent().removeClass('has-error');
          $(this).popover('hide');
        }
      }
    });

    if (validData) {
      $('#signup-box button').popover('destroy');
      fields.hashedPassword = fields.password;
      delete fields.password;
      delete fields.repeatedPassword;

      var user  = new Users(fields);
      user.$save(function (res) {
        window.location = '/app';
      }, function (res) {
        $('#signup-box button').popover({
          content: res.data,
          placement: 'left',
          trigger: 'manual'
        });
        $('#signup-box button').popover('show');
        setTimeout(function () {
          $('#signup-box button').popover('hide');
        }, 3000);
      });
    }
  }

  var getErrorForField = function (field, value) {
    if (!value || value === '') return 'Must not be empty!';

    var usernameRE = /^[^\s\/\\\?\%\*\:\|\"<>\.]+$/;
    if (field === 'username') {
      if (!usernameRE.test(value) || value.length < 4 || value.length > 20) {
        return 'Username should be more than 4 symbols and less than 20, and should not contain following symbols: /\|?:*".<>% and space'
      }
    }

    return null;
  };
}]);