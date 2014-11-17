app.controller('EventController', ['$scope', 'Global', 'Users', 'Events', function ($scope, Global, Users, Events) {
  $scope.global = Global;

  Users.getCurrentUser(function () {

  });

  $scope.setEditable = function (status) {
    if (status) {
      $scope.newEvent = {};

      $('.event-name .editable').editable({
        type: 'text',
        mode: 'popup',
        placeholder: 'Event title',
        value: '',
        title: 'Enter event title',
        onblur: 'cancel',
        send: 'always',
        highlight: false,
        validate: validateEventName,
        success: function (response, newValue) {
          $scope.newEvent.title = newValue;
          $('.event-name .editable').removeClass('has-error');
        }
      });

      $('.event-description .editable').editable({
        type: 'textarea',
        mode: 'popup',
        placeholder: 'Event description',
        value: '',
        title: 'Describe your event',
        send: 'always',
        highlight: false,
        success: function (response, newValue) {
          $scope.newEvent.desc = newValue;
          $('.event-description .editable').removeClass('has-error');
        }
      });

      $('.event-date .editable').editable({
        type: 'combodate',
        mode: 'popup',
        title: 'Event date',
        send: 'always',
        highlight: false,
        placement: 'right',
        template: 'DD MMMM YYYY',
        format: 'Do MMM YYYY',
        combodate: {
          value: moment().toDate(),
          minYear: moment().get('year'),
          maxYear: moment().get('year') + 5,
          yearDescending: false
        },
        success: function (response, newValue) {
          $scope.newEvent.date = newValue;
          $('.event-date .editable').removeClass('has-error');
        }
      });

      $('.event-time .editable').editable({
        type: 'combodate',
        mode: 'popup',
        title: 'Event date',
        send: 'always',
        highlight: false,
        placement: 'right',
        template: 'H:mm',
        format: 'HH:mm',
        combodate: {
          value: moment().toDate()
        },
        success: function (response, newValue) {
          $scope.newEvent.time = newValue;
          $('.event-time .editable').removeClass('has-error');
        }
      });
    }
  }

  $scope.goBack = function () {
    window.history.back();
  }

  $scope.createEvent = function () {
    var eventNameError = validateEventName($scope.newEvent.title);
    var eventDateError = validateEventDate($scope.newEvent.date);
    var eventTimeError = validateEventTime($scope.newEvent.time, $scope.newEvent.allDay);

    if (eventNameError) {
      $('.event-name .editable').addClass('has-error');
    }
    if (eventDateError) {
      $('.event-date .editable').addClass('has-error');
    }
    if (eventTimeError) {
      $('.event-time .editable').addClass('has-error');
    }

    if (eventNameError || eventDateError || eventTimeError) return;

    var event = new Events($scope.newEvent);
    event.date = moment().set('year', $scope.newEvent.date.get('year'));
    event.date = moment().set('month', $scope.newEvent.date.get('month'));
    event.date = moment().set('date', $scope.newEvent.date.get('date'));

    if (!event.allDay) {
      event.date = moment(event.date).set('hour', $scope.newEvent.time.get('hour'));
      event.date = moment(event.date).set('minute', $scope.newEvent.time.get('minute'));
    }

    if (!event.allDay) event.allDay = false;
    event.name = event.title;

    delete event.title;
    delete event.time;

    event.$save(function (res) {
      window.location.pathname = "/events/" + res.id;
    }, function (res) {
      alert(res.data);
    });
  }

  var validateEventName = function (name) {
    if (!name || name.length === 0 || name === '') return 'Name should not be empty!';
    return null;
  }

  var validateEventDate = function (date) {
    if (!date) return 'Date should not be empty';
    return null;
  }

  var validateEventTime = function (time, allDay) {
    if (allDay) return null;
    if (!time) return 'Time should not be empty';
    return null;
  }
}]);