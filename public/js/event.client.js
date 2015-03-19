var app = window.exports = angular.module('EventorioEvent', ['ngResource', 'angular-growl', 'xeditable', 'textAngular', 'cropme']);

app.run(function(editableOptions, editableThemes) {
  editableThemes.bs3.buttonsClass = 'btn-sm';
  editableThemes.bs3.inputClass = 'input-lg';
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});
app.config(['growlProvider', function(growlProvider) {
  growlProvider.globalTimeToLive(5000);
  growlProvider.globalDisableCountDown(true);
}]);
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
  },
  google: {
    currentLocationMarker: 'http://i.stack.imgur.com/orZ4x.png'
  }
}
