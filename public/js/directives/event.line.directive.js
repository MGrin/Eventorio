'use strict';

app.directive('eventLine', ['$rootScope', 'Global', function ($rootScope, Global) { // jshint ignore:line
  return {
    scope: {
      event: '=event'
    },
    templateUrl: '/view/event.line.template.html',
    link: function ($scope, element) {
      $scope.event.date = moment($scope.event.date); // jshint ignore:line
    },
  };
}]);
