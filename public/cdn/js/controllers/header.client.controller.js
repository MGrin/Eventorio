app.controller('HeaderController', ['$scope', '$location', 'Global', 'Users', function ($scope, $location, Global, Users) {
  $scope.global = Global;

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
        console.log('Error: ' + fieldError);
      } else {
        console.log(field);
        if ($(elem).parent().hasClass('has-error')) {
          $(elem).parent().removeClass('has-error');
        }
      }
    });

    if (validData) {
      Users.login(fields.username, fields.password, function (err) {
        if (err) {
          return console.log('Error: ' + err);
        }
        window.location = '/app';
      });
    }
  }

  $scope.toggleSidebarMenu = function () {
    var closed = $('.menu').hasClass('closed');
    if(closed) return $('.menu').removeClass('closed')
    else return $('.menu').addClass('closed')
  }

  var getErrorForField = function (field, value) {
    if (!value || value === '') return 'Must not be empty!';

    return null;
  }
}]);