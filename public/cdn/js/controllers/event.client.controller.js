app.controller('EventController', ['$scope', 'Global', 'Users', 'Events', function ($scope, Global, Users, Events) {
  $scope.global = Global;

  $scope.$on('me', function () {
    $scope.event = Events.get({eventId: window.location.pathname.split('/')[2]}, function () {
      $scope.show = true;
      $scope.setEditable($scope.edit, ($scope.edit)?'Create':'Normal');
    });
  });

  $scope.setEditable = function (status, mode) {
    if (status) {
      $scope.mode = mode;

      $scope.newEvent = {};

      $('.event-name').editable({
        type: 'text',
        mode: 'inline',
        placeholder: 'Event title',
        title: 'Enter event title',
        onblur: 'cancel',
        value: (mode === 'Create')?'':$scope.event.name,
        send: 'always',
        selector: '.editable',
        highlight: false,
        validate: validateEventName,
        success: function (response, newValue) {
          $scope.newEvent.title = newValue;
          $('.event-name .editable').removeClass('has-error');
        }
      });

      $('.event-description textarea').wysihtml5();
      $('.event-description textarea').val($scope.event.desc);

      $('.event-date').editable({
        type: 'combodate',
        mode: 'inline',
        title: 'Event date',
        send: 'always',
        selector: '.editable',
        value: (mode === 'Create')?'':moment($scope.event.date).format('DD MMMM YYYY'),
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

      $('.event-time').editable({
        type: 'combodate',
        mode: 'inline',
        title: 'Event date',
        send: 'always',
        selector: '.editable',
        value: (mode === 'Create')?'':moment($scope.event.date).format('HH:mm'),
        highlight: false,
        placement: 'right',
        template: 'HH:mm',
        format: 'HH:mm',
        combodate: {
          value: moment().toDate()
        },
        success: function (response, newValue) {
          $scope.newEvent.time = newValue;
          $('.event-time .editable').removeClass('has-error');
        }
      });

      $('.event-visibility').editable({
        type: 'select',
        mode: 'inline',
        title: 'Event visibility',
        send: 'always',
        selector: '.editable',
        value: 'public',
        highlight: false,
        placement: 'right',
        source: [
          {value: 'public', text: 'Event is visible to everyone'},
          {value: 'followers', text: 'Event is visible only to your followers'},
          {value: 'invitations', text: 'Event is visible only to invited people'}
        ],
        success: function (response, newValue) {
          $scope.newEvent.visibility = newValue;
        }
      });

      $('.event-attendance').editable({
        type: 'select',
        mode: 'inline',
        title: 'Event attendance',
        send: 'always',
        selector: '.editable',
        value: 'public',
        highlight: false,
        placement: 'right',
        source: [
          {value: 'public', text: 'Everyone can attend this event'},
          {value: 'followers', text: 'Only your followers can attend this event'},
          {value: 'invitations', text: 'Only invited people can attend this event'}
        ], success: function (response, newValue) {
          $scope.newEvent.attendance = newValue;
        }
      });
    } else {
      $scope.mode = 'Normal';
    }
  }

  $scope.goBack = function () {
    window.history.back();
  }
  $scope.cancel = function () {
    window.location.reload();
  }

  $scope.attendTheEvent = function () {
    Users.attend($scope.event, function (err) {
      $scope.event.attendees.push(Global.me.id);
      if ($scope.event.invitedUsers.indexOf(Global.me.id) !== -1) {
        $scope.event.invitedUsers.splice($scope.event.invitedUsers.indexOf(Global.me.id), 1);
      }
      if ($scope.event.participants.indexOf(Global.me) === -1 && $scope.event.participants.length < 6) {
        $scope.event.participants.push(Global.me);
      }
    });
  }

  $scope.quitTheEvent = function () {
    Users.quit($scope.event, function (err) {
      $scope.event.attendees.splice($scope.event.attendees.indexOf(Global.me), 1);
      $scope.event.participants.splice($scope.event.participants.indexOf(Global.me), 1);
    });
  }

  $scope.showAllParticipants = function () {
    Events.getParticipants($scope.event, function (err, data) {
      $scope.attendees = data.attendees;
      $scope.invited = data.invited;
    });
  }

  $scope.invite = function () {
    $('#emailsToInvite').removeClass('has-error');
    $('#emailsToInvite label').text('');

    var text = $('#emailsToInvite textarea').val();
    if (!text || text === '') {
      $('#emailsToInvite').addClass('has-error');
      $('#emailsToInvite label').text('Please enter at least one email');
    }

    text = text.replace(/\s/g, '');
    var emails = text.split(',');
    _.each(emails, function (email) {
      // TODO verify emails
    });

    $('#invitationModal').toggle();
    Users.invite(emails, $scope.event, function (err) {
      if (err) {
        Global.showError(err);
      }
    });
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
    event.date = moment()
                  .set('year', $scope.newEvent.date.get('year'))
                  .set('month', $scope.newEvent.date.get('month'))
                  .set('date', $scope.newEvent.date.get('date'));

    if (!event.allDay) {
      event.date = event.date.set('hour', $scope.newEvent.time.get('hour'))
                              .set('minute', $scope.newEvent.time.get('minute'));
      event.allDay = false;
    }

    event.name = event.title;
    event.desc = $('.event-description textarea').val();

    delete event.title;
    delete event.time;

    event.$save(function (res) {
      window.location.pathname = "/events/" + res.id;
    }, function (res) {
      Global.showError(res.data);
    });
  }

  $scope.modifyEvent = function () {
    var modifications = $scope.newEvent;

    if (!modifications.title) modifications.title = $scope.event.name;
    if (!modifications.date) modifications.date = moment($scope.event.date);
    if (!modifications.time) modifications.time = moment($scope.event.date);
    if (!modifications.allDay) modifications.allDay = $scope.event.isAllDay;
    if (!modifications.visibility) modifications.visibility = $scope.event.visibility;
    if (!modifications.attendance) modifications.attendance = $scope.event.attendance;

    var eventNameError = validateEventName(modifications.title);
    var eventDateError = validateEventDate(modifications.date);
    var eventTimeError = validateEventTime(modifications.time, modifications.allDay);

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
    modifications.date = moment()
                          .set('year', modifications.date.get('year'))
                          .set('month', modifications.date.get('month'))
                          .set('date', modifications.date.get('date'));
    if (!modifications.allDay) {
      modifications.date = modifications.date.set('hour', modifications.time.get('hour'))
                                              .set('minute', modifications.time.get('minute'));
      modifications.allDay = false;
    }

    modifications.name = modifications.title;
    modifications.desc = $('.event-description textarea').val();

    delete modifications.title;
    delete modifications.time;

    $scope.event = Events.update({eventId: $scope.event.id}, modifications, function () {
      window.location.reload();
    });
  }

  var validateEventName = function (name) {
    if (!name || name.length === 0 || name === '') return 'Name should not be empty!';
    if (name.length > 20) return 'Name should not be larger than 20 characters';
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