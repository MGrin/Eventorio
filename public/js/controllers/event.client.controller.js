app.controller('EventController', ['$scope', '$rootScope', 'Global', 'Users', 'Events', 'Notifications',
  function ($scope, $rootScope, Global, Users, Events, Notifications) {
  $scope.global = Global;
  $scope.now = moment();

  Events.updateMonthlyList($scope.now, function (err, events) {
    $rootScope.$broadcast('day', $scope.now, _.filter(events, function (event) {
      return moment(event.date).format('YYYYMMDD') === $scope.now.format('YYYYMMDD');
    }));
  });

  $scope.$on('me', function () {
    $scope.event = Events.get({eventId: window.location.pathname.split('/')[2]}, function () {
      $scope.show = true;
      $scope.setEditable($scope.edit, ($scope.edit)?'Create':'Normal');
      $scope.event.date = moment($scope.event.date);
    });
  });

  $scope.setEditable = function (status, mode) {
    if (status) {
      $scope.mode = mode;
      if (mode === 'Create') {
        $scope.event = {
          date: moment(),
          visibility: 'public',
          attendance: 'public'
        };
      } else {
        console.log($scope.event);
      }

      $('.event-name').editable({
        type: 'text',
        mode: 'inline',
        placeholder: 'Event title',
        title: 'Enter event title',
        onblur: 'submit',
        value: (mode === 'Create')?'':$scope.event.name,
        send: 'always',
        selector: '.editable',
        highlight: false,
        showbuttons: false,
        success: function (response, newValue) {
          $scope.event.name = newValue;
          console.log($scope.event);
        }
      });

      $('.event-visibility').editable({
        type: 'select',
        mode: 'inline',
        title: 'Event visibility',
        send: 'always',
        onblur: 'submit',
        selector: '.editable',
        value: 'public',
        highlight: false,
        placement: 'right',
        showbuttons: false,
        source: [
          {value: 'public', text: 'Event is visible to everyone'},
          {value: 'followers', text: 'Event is visible only to your followers'},
          {value: 'invitations', text: 'Event is visible only to invited people'}
        ],
        success: function (response, newValue) {
          $scope.event.visibility = newValue;
        }
      });

      $('.event-attendance').editable({
        type: 'select',
        mode: 'inline',
        title: 'Event attendance',
        send: 'always',
        selector: '.editable',
        value: 'public',
        onblur: 'submit',
        highlight: false,
        placement: 'right',
        showbuttons: false,
        source: [
          {value: 'public', text: 'Everyone can attend this event'},
          {value: 'followers', text: 'Only your followers can attend this event'},
          {value: 'invitations', text: 'Only invited people can attend this event'}
        ], success: function (response, newValue) {
          $scope.event.attendance = newValue;
        }
      });

      $('.clockpicker').clockpicker({
        default: 'now'
      }).find('input').change(function () {
        var temp = this.value.split(':');
        if (!$scope.event.date) $scope.event.date = moment();
        $scope.event.date.hours(parseInt(temp[0]));
        $scope.event.date.minutes(parseInt(temp[1]));
        $scope.$apply();
      });
      $scope.$on('day', function (info, date, events) {
        date = moment(date);
        if (!$scope.event.date) $scope.event.date = date;
        else $scope.event.date = $scope.event.date.year(date.year()).month(date.month()).date(date.date());
      });

      $('textarea.eventDescriptionField').html($scope.event.desc);
      $('textarea.eventDescriptionField').wysihtml5({
        "events": {
          "load": function() {
          },
          "blur": function() {
            $scope.event.desc = $(this)[0].textarea.element.value;
          }
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

    $('#invitationModal').toggle();
    Users.invite(emails, $scope.event, function (err) {
      if (err) {
        Notifications.error($('#header'), err);
      }
    });
  }

  $scope.createEvent = function () {
    if (!$scope.event.name || $scope.event.name.length < 1 || $scope.event.name > 20) {
      Notifications.error($('#header'), 'Name should not be empty and should not be longer than 20 characters');
      return;
    }
    var event = new Events($scope.event);

    event.$save(function (res) {
      window.location.pathname = "/events/" + res.id;
    }, function (res) {
      Notifications.error($('#header'),res.data);
    });
  }

  $scope.modifyEvent = function () {
    if (!$scope.event.name || $scope.event.name.length < 1 || $scope.event.name > 20) {
      Notifications.error($('#header'), 'Name should not be empty and should not be longer than 20 characters');
      return;
    }
    $scope.event = Events.update({eventId: $scope.event.id}, $scope.event, function () {
      window.location.reload();
    });
  }
}]);