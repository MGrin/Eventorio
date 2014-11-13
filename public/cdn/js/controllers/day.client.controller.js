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
    // TODO
    alert('Implement it!!!');
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
      fields.date = $scope.day;
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
    if (filed === 'name') {
      if (value.length > 30) return 'The name should not contain more than 30 characters';
    }
    return null;
  }
}]);