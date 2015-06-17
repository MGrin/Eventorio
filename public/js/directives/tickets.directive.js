'use strict';

app.directive('tickets', [function () { // jshint ignore:line
  return {
    scope: {
      event: '=',
      mode: '='
    },
    templateUrl: '/view/tickets.template.html',
    link: function ($scope) {
      $scope.user = $scope.$parent.global.me;

      $scope.newTicket = {
        price: null,
        name: null,
        quantity: null
      };

      $scope.addTicket = function () {
        var ticket = {
          price: $scope.newTicket.price,
          name: $scope.newTicket.name,
          quantity: $scope.newTicket.quantity
        };

        $scope.event.tickets.push(ticket);
        $scope.newTicket = {
          price: null,
          name: null,
          quantity: null
        };

        // $scope.$apply();
      };

      $scope.removeTicket = function (index) {
        $scope.event.tickets.splice(index, 1);
      };

      $scope.purchaseTicket = function (index) {
        var ticket = $scope.event.tickets[index];
        $scope.$emit('ticket:purchase', ticket);
      };
    }
  };
}]);
