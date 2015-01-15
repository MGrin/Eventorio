var app = window.exports = angular.module('EventorioApp', ['ngResource', 'ngSanitize', 'siyfion.sfTypeahead', 'xeditable']);

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3';
});

$(document).ready(function () {
  'use strict';

});
