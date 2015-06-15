'use strict';

app.controller('HeaderController', ['$scope', '$rootScope', 'Global', 'Users', // jshint ignore:line
  function ($scope, $rootScope, Global) {
    $scope.global = Global;

    $scope.view = 'login';
}]);
