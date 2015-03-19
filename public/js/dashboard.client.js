var app = window.exports = angular.module('EventorioDashboard', ['ngResource', 'angular-growl']);

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
  }
}
