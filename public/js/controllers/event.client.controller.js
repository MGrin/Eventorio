'use strict';

app.controller('EventController', ['$scope', '$rootScope', 'Global', 'Users', 'Events', 'growl', // jshint ignore:line
  function ($scope, $rootScope, Global, Users, Events, growl) { // jshint ignore:line

  var fixEvent = function (event) {
    if (event.date) event.date = moment(event.date); // jshint ignore:line
    if (!event.organizator) event.organizator = Global.me;
    if (!event.venue) event.venue = {};
    if (!event.desc) event.desc='';

    if (!event.tickets) event.tickets = [];

    return event;
  };

  $scope.global = Global;
  $scope.event = fixEvent(app.event); // jshint ignore:line

  $scope.isNew = $scope.event.id ? false : true;
  $scope.isEditable = Global.me ? (Global.me.id === $scope.event.organizator.id) : false;

  $scope.editmode = $scope.isNew;

  $scope.$on('clockpicker:time', function (info, hours, minutes) {
    if (!$scope.event.date) $scope.event.date = moment(); // jshint ignore:line

    $scope.event.date.hour(hours);
    $scope.event.date.minute(minutes);

    $scope.$apply();
  });

  $scope.$on('event:save:error', function (info, errors) {
    _.each(errors, function (err) { // jshint ignore:line
      growl.error(err);
    });
  });

  $scope.$on('ticket:purchase', function (info, ticket) {
    $scope.purchasingTicket = ticket;
  });

  $scope.save = function () {
    var errors = app.validator.validateEvent($scope.event); // jshint ignore:line

    if (errors) return $scope.$broadcast('event:save:error', errors);

    if ($scope.isNew) {
      var event = new Events($scope.event);
      event.$save(function (event) {
        window.location.href = '/events/' + event.id;
      });
    } else {
      Events.update({_id: $scope.event.id, event: $scope.event}, function (event) {
        var venue = $scope.event.venue;
        $scope.event = fixEvent(event);
        $scope.event.venue = venue;
        $scope.editmode = false;
      });
    }
  };

  $scope.cancel = function () {
    if ($scope.isNew) {
      window.location.href = '/';
      return;
    }
    $scope.editmode = false;
  };

  $scope.cancelLogo = function () {
    $scope.$broadcast('cropme:cancel');
  };

  $scope.enterEditMode = function () {
    $scope.editmode = true;
  };
}]);
