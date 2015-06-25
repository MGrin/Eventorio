'use strict';

app.controller('EventController', ['$scope', '$rootScope', 'Global', 'Users', 'Events', 'growl', 'Pictures', // jshint ignore:line
  function ($scope, $rootScope, Global, Users, Events, growl, Pictures) { // jshint ignore:line

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

    if ($scope.event.originalHeaderPicture && $scope.event.originalHeaderPicture !== $scope.event.headerPicture) {
      Pictures.remove($scope.event.id || 'temp', 'header', $scope.event.originalHeaderPicture, function (err) {
        if (err) growl.error('Failed to remove your old header. Do not worry =)');
      });
    }
    if ($scope.isNew) {
      var event = new Events($scope.event);
      event.$save(function (event) {
        Pictures.confirm(event.id, 'header', event.headerPicture, function () {});
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
    if ($scope.event.headerPicture !== $scope.event.originalHeaderPicture) {
      Pictures.remove($scope.event.id || 'temp', 'header', $scope.event.headerPicture, function (err) {
        if (err) growl.error('Failed to remove your old header. Do not worry =)');
      });
    }
    $scope.event.headerPicture = $scope.event.originalHeaderPicture;

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
    if ($scope.event.headerPicture) $scope.event.originalHeaderPicture = $scope.event.headerPicture;
    $scope.editmode = true;
  };

  $scope.uploadHeader = function(event){
    var files = event.target.files;
    if (files.length === 0) return;
    if (files.length > 1) return growl.error('You can not upload more than one header image!');

    var picture = files[0];

    var err = app.validator.validateImageExt(picture); // jshint ignore:line
    if (err) return growl.error(err);

    $scope.$broadcast('header:uploading:start');

    // Remove all previously uploaded pictures in the edit mode
    if ($scope.event.headerPicture !== $scope.event.originalHeaderPicture) {
      Pictures.remove($scope.event.id || 'temp', 'header', $scope.event.headerPicture, function (err) {
        if (err) growl.error('Failed to remove your old header. Do not worry =)');
      });
    }
    Pictures.upload(picture, $scope.event.id, 'header', function (err, name) {
      if (err || !name) {
        growl.error('Failed to upload the header picture');
        return $scope.$broadcast('header:uploading:stop');
      }

      $scope.event.headerPicture = name;
      $scope.$apply();
      $scope.$broadcast('header:uploading:stop');
    });
  };
}]);
