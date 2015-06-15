'use strict';

var app = window.exports = angular.module('EventorioUser', ['ngResource', 'angular-growl', 'xeditable']);

$(document).ready(function () {
  $('.redirect').each(function () {
    var href = $(this).attr('href') + '?redirect=' + window.location.href;
    $(this).attr('href', href);
  });
});

app.run(function(editableOptions, editableThemes) {
  editableThemes.bs3.buttonsClass = 'btn-sm';
  editableThemes.bs3.inputClass = 'input-lg';
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});
app.config(['growlProvider', function(growlProvider) {
  growlProvider.globalTimeToLive(5000);
  growlProvider.globalDisableCountDown(true);
}]);
