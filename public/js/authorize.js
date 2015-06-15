'use strict';

var usernameRE = /^[a-zA-Z0-9]{4,20}$/;
var passwordRE = /^.{8,}$/;

var signup = function () {
  var usernameIn = $('#user-signup-form input[name="username"]');
  var emailIn = $('#user-signup-form input[name="email"]');
  var passwordIn = $('#user-signup-form input[name="password"]');
  var repeatPasswordIn = $('#user-signup-form input[name="repeatPassword"]');

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
    usernameIn.tooltip({title: 'Should be more than 4 characters, and can be letters or digits', placement: 'top'});
    usernameIn.parent().addClass('has-error');
    usernameIn.focus();
    return;
  }

  if (!email) {
    emailIn.tooltip({title: 'Should be a valid email', placement: 'top'});
    emailIn.parent().addClass('has-error');
    emailIn.focus();
    return;
  }

  if (!password || !password.match(passwordRE)) {
    passwordIn.tooltip({title: 'Should be more than 8 characters.', placement: 'top'});
    passwordIn.parent().addClass('has-error');
    passwordIn.focus();
    return;
  }

  if (password !== repeatPassword) {
    repeatPasswordIn.tooltip({title: 'Should be the same as password field.', placement: 'top'});
    repeatPasswordIn.parent().addClass('has-error');
    repeatPasswordIn.focus();
    return;
  }

  var data = {username: username, email: email, password: password, redirect: window.location.href};
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
      500: function (res) {
        var error = res.responseJSON;
        var field = error.substring(0, error.indexOf(':'));
        error = error.substring(field.length + 1, error.length);
        console.log(error);
        if (field === 'username') {
          usernameIn.tooltip({title: error, placement: 'top'});
          usernameIn.parent().addClass('has-error');
          usernameIn.focus();
          return;
        } else if (field === 'email') {
          emailIn.tooltip({title: error, placement: 'top'});
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
};

var login = function () {
  var usernameIn = $('#user-login-form input[name="username"]');
  var passwordIn = $('#user-login-form input[name="password"]');

  usernameIn.parent().removeClass('has-error');
  usernameIn.tooltip('destroy');
  passwordIn.parent().removeClass('has-error');
  passwordIn.tooltip('destroy');

  $('#login-action').tooltip('destroy');

  var username = usernameIn.val();
  var password = passwordIn.val();

  if (!username || !username.match(usernameRE)) {
    usernameIn.tooltip({title: 'Wrong username', placement: 'top'});
    usernameIn.parent().addClass('has-error');
    usernameIn.focus();
    return;
  }

  if (!password || !password.match(passwordRE)) {
    passwordIn.tooltip({title: 'Wrong password', placement: 'top'});
    passwordIn.parent().addClass('has-error');
    passwordIn.focus();
    return;
  }

  var data = {username: username, password: password, redirect: window.location.href};
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
        $('#login-action').tooltip({title: error, placement: 'top'});
        $('#login-action').focus();
      },
      404: function () {
        alert('Server is down, sorry =(');
      }
    }
  });
};

$(document).ready(function () {  
  $('#user-signup-form').submit(function (e) {
    e.preventDefault();
    signup();
  });

  $('#user-login-form').submit(function (e) {
    e.preventDefault();
    login();
  });
});
