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

  $scope.save = function () {
    var errors = $scope.validate($scope.event);

    if (errors) return $scope.$broadcast('event:save:error', errors);

    if ($scope.isNew) {
      var event = new Events($scope.event);
      event.$save(function (event) {
        window.location.href = '/events/' + event.id;
      });
    } else {
      Events.update({_id: $scope.event.id, event: $scope.event}, function (event) {
        var venue = $scope.event.venue;
        $scope.event = $scope.fixEvent(event);
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

  $scope.validate = function (event) {
    var errors = [];
    var nameError = app.validator.validateEventName(event.name); // jshint ignore:line
    var dateError = app.validator.validateEventDate(event.date); // jshint ignore:line
    var venueError = app.validator.validateEventVenue(event.venue); // jshint ignore:line

    if (nameError) errors.push({field: 'name', message: nameError});
    if (dateError) errors.push({field: 'date', message: dateError});
    if (venueError) errors.push({field: 'venue', message: venueError});

    return errors.length === 0 ? null : errors;
  };

  $scope.enterEditMode = function () {
    $scope.editmode = true;
  };
}]);
