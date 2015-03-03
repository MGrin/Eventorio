var app = window.exports = angular.module('EventorioApp', ['ngResource', 'ngSanitize', 'cropme', 'xeditable']);
app.run(function(editableOptions, editableThemes) {
  editableThemes.bs3.buttonsClass = 'btn-sm';
  editableThemes.bs3.inputClass = 'input-lg';
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

app.config = {
  img: {
    cover: {
      width: 1200,
      height: 350
    },
    avatar: {
      width: 450,
      height: 450
    }
  }
}

$(document).ready(function () {
  'use strict';
});
