app.controller('DaylyController', ['$scope', 'Global', 'Events', function ($scope, Global, Events) {

  var updateDayEvents = function () {
    $scope.dayEvents = [];
    var calendarDate = $scope.constructDateInCalendarFormat($scope.day);

    if ($scope.$parent.events[calendarDate]) {
      _.each($scope.$parent.events[calendarDate].dayEvents, function (event) {
        $scope.dayEvents.push(event);
      });
    }
  }

  $scope.global = Global;
  $scope.day = new Date();
  $scope.dayStr = $scope.day.getDate() + ' ' + Global.monthNames[$scope.day.getMonth()] + ' ' + $scope.day.getFullYear();
  $scope.dayEvents;

  $scope.$on('ChoosenDay', function (message) {
    $scope.day = message.targetScope.choosenDay;
    $scope.dayStr = $scope.day.getDate() + ' ' + Global.monthNames[$scope.day.getMonth()] + ' ' + $scope.day.getFullYear();

    updateDayEvents();

    $scope.$apply();
  });

  $scope.showEventCreationDialog = function () {
    $('#eventCreationDialog').slideToggle();
    if ($('#eventCreationDialogTrigger h1').hasClass('glyphicon-plus-sign')) {
      $('#eventCreationDialogTrigger h1').removeClass('glyphicon-plus-sign');
      $('#eventCreationDialogTrigger h1').addClass('glyphicon-minus-sign');
    } else if ($('#eventCreationDialogTrigger h1').hasClass('glyphicon-minus-sign')) {
      $('#eventCreationDialogTrigger h1').removeClass('glyphicon-minus-sign');
      $('#eventCreationDialogTrigger h1').addClass('glyphicon-plus-sign');
    }
  }

  $scope.createEvent = function () {
    var fields = {};
    var validData = true;

    $('#eventCreationDialog :input').each(function () {
      var elem = this;

      var field = $(elem).attr('name');
      var val = $(elem).val();
      if (!field) return;

      fields[field] = val;

      var fieldError = getErrorForField(field, val)
      if (fieldError) {
        validData = false;
        if (!$(elem).parent().hasClass('has-error')) {
          $(elem).parent().addClass('has-error');
        }
        // TODO Show error
        console.log(field + ': ' + fieldError);
      } else {
        if ($(elem).parent().hasClass('has-error')) {
          $(elem).parent().removeClass('has-error');
        }
      }
    });

    if (validData) {
      fields.date = $scope.higlightedDay;
      var event = new Events(fields);

      event.$save(function (res) {
        window.location = res.redirect;
      }, function (res) {
        console.log('Error');
        console.log(res);
      });
    }
  }

  var getErrorForField = function (field, value) {
    if (field !== 'desc' && (!value || value === '')) return 'Must not be empty!';

    return null;
  }
}]);