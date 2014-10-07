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
        // TODO Show error
        console.log(field + ': ' + fieldError);
      } else {
        if ($(elem).parent().hasClass('has-error')) {
          $(elem).parent().removeClass('has-error');
        }
      }
    });

    if (validData) {
      fields.hashedPassword = fields.password;
      delete fields.password;
      delete fields.repeatedPassword;

      var user  = new Users(fields);
      user.$save(function (res) {
        window.location = '/app';
      }, function (res) {
        console.log('Error: ' + res.data);
      });
    }
  }

  var getErrorForField = function (field, value) {
    if (!value || value === '') return 'Must not be empty!';

    var usernameRE = /^[^\/\\\?\%\*\:\|\"<>\.]+$/;
    if (field === 'username') {
      if (!usernameRE.test(value) || value.length < 4) {
        return 'Usernaem should be more than 4 symbols, and should not contain following symbols: /\|?:*".<>%'
      }
    }

    return null;
  };
}]);