$(document).ready(function () {
  var usernameRE = /^[a-zA-Z0-9]{4,20}$/;
  var passwordRE = /^.{8,}$/;

  $('#login-action').click(function () {
    console.log('Click');
    var usernameIn = $('#login-modal input[name="username"]');
    var passwordIn = $('#login-modal input[name="password"]');

    usernameIn.parent().removeClass('has-error');
    usernameIn.tooltip('destroy');
    passwordIn.parent().removeClass('has-error');
    passwordIn.tooltip('destroy');

    $('#login-action').tooltip('destroy');

    var username = usernameIn.val();
    var password = passwordIn.val();

    if (!username || !username.match(usernameRE)) {
      usernameIn.tooltip({title: 'Wrong username', placement: 'left'});
      usernameIn.parent().addClass('has-error');
      usernameIn.focus();
      return;
    }

    if (!password || !password.match(passwordRE)) {
      passwordIn.tooltip({title: 'Wrong password', placement: 'left'});
      passwordIn.parent().addClass('has-error');
      passwordIn.focus();
      return;
    }

    var data = {username: username, password: password};
    $.ajax({
      type: 'POST',
      url: '/login',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(data),
      statusCode: {
        200: function () {
          window.location.reload();
        },
        500: function (res) {
          var error = res.responseJSON;
          $('#login-action').tooltip({title: error, placement: 'left'});
          $('#login-action').focus();
        },
        404: function () {
          alert('Server is down, sorry =(');
        }
      }
    });
  });

  $('#signup-btn').click(function () {
    var usernameIn = $('#signup-form input[name="username"]');
    var emailIn = $('#signup-form input[name="email"]');
    var passwordIn = $('#signup-form input[name="password"]');
    var repeatPasswordIn = $('#signup-form input[name="repeatPassword"]');

    usernameIn.parent().removeClass('has-error');
    usernameIn.tooltip('destroy');
    emailIn.parent().removeClass('has-error');
    emailIn.tooltip('destroy');
    passwordIn.parent().removeClass('has-error');
    passwordIn.tooltip('destroy');
    repeatPasswordIn.parent().removeClass('has-error');
    repeatPasswordIn.tooltip('destroy');

    var username = usernameIn.val();
    var email = emailIn.val();
    var password = passwordIn.val();
    var repeatPassword = repeatPasswordIn.val();

    if (!username || !username.match(usernameRE)) {
      usernameIn.tooltip({title: 'Should be more than 4 characters, and can be letters or digits', placement: 'left'});
      usernameIn.parent().addClass('has-error');
      usernameIn.focus();
      return;
    }

    if (!email) {
      emailIn.tooltip({title: 'Should be a valid email', placement: 'left'});
      emailIn.parent().addClass('has-error');
      emailIn.focus();
      return;
    }

    if (!password || !password.match(passwordRE)) {
      passwordIn.tooltip({title: 'Should be more than 8 characters.', placement: 'left'});
      passwordIn.parent().addClass('has-error');
      passwordIn.focus();
      return;
    }

    if (password !== repeatPassword) {
      repeatPasswordIn.tooltip({title: 'Should be the same as password field.', placement: 'left'});
      repeatPasswordIn.parent().addClass('has-error');
      repeatPasswordIn.focus();
      return;
    }

    var data = {username: username, email: email, hashedPassword: password};
    $.ajax({
      type: 'POST',
      url: '/users',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(data),
      statusCode: {
        200: function () {
          window.location.reload();
        },
        500: function () {
          var error = res.responseJSON;
          var field = error.substring(0, error.indexOf(':'));
          error = error.substring(field.length + 1, error.length);
          console.log(field);
          if (field === 'username') {
            console.log(error);
            usernameIn.tooltip({title: error, placement: 'left'});
            usernameIn.parent().addClass('has-error');
            usernameIn.focus();
            return;
          } else if (field === 'email') {
            console.log(error);
            emailIn.tooltip({title: error, placement: 'left'});
            emailIn.parent().addClass('has-error');
            emailIn.focus();
            return;
          }
        },
        404: function () {
          alert('Server is down, sorry =(');
        }
      }
    });
  });
});