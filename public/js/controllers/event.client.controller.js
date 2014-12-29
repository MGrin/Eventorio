app.controller('EventController', ['$scope', '$rootScope', 'Global', 'Users', 'Events', 'Notifications', 'Comments',
  function ($scope, $rootScope, Global, Users, Events, Notifications, Comments) {
  $scope.global = Global;
  $scope.now = moment();

  $scope.view = 'description';

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

      $scope.event.comments = Comments.get({eventId: window.location.pathname.split('/')[2]}, function () {
        console.log($scope.event.comments);
      });
    });
  });

  if (Global.screenSize === 'lg') {
    $('#leftSidebar').addClass('affix');
    $('#leftSidebar').addClass('affix-top');
  }

  $scope.showDescription = function () {
    if ($scope.view === 'description') return;
    $scope.view = 'description';
    $('#descriptionTab').addClass('active');
    $('#commentsTab').removeClass('active');
  }
  $scope.showComments = function () {
    if ($scope.view === 'comments') return;
    $scope.view = 'comments';
    $('#commentsTab').addClass('active');
    $('#descriptionTab').removeClass('active');
  }

  $scope.setEditable = function (status, mode) {
    if (status) {
      $scope.mode = mode;
      if (mode === 'Create') {
        $scope.event = {
          date: moment(),
          visibility: 'public',
          attendance: 'public'
        };
      }

      $scope.view='description';

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
          }
        }
      });
    } else {
      $scope.mode = 'Normal';
      setTimeout(function () {
        $('textarea.form-control.comment-input').wysihtml5();
      }, 250);
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
  };

  $scope.comment = function () {
    var comment;
    if (Global.screenSize === 'xs') comment = $('textarea.form-control.comment-input-xs').val();
    else comment = $('textarea.form-control.comment-input').val();

    comment = '<div>' + comment + '</div>';
    commentHtml = $(comment);
    $(commentHtml).each(function () {
      $(this).find('img').each(function () {
        $(this).addClass('img');
        $(this).addClass('img-responsive');
      });
    });

    var comment = new Comments({content: $(comment).prop('outerHTML'), event: $scope.event});
    comment.$save(function (res) {
      $scope.event.comments.comments.push(res);
      $('textarea.form-control.comment-input-xs').val('');
      $('textarea.form-control.comment-input').val();
    }, function (res) {
      Notifications.error($('#header'),res.data);
    })
  }

  $scope.getDescription = function () {
    var desc;

    if (Global.screenSize === 'lg') desc = $('.hidden-xs .event-description textarea.eventDescriptionField').val();
    else desc = $('.visible-xs .event-description textarea.eventDescriptionField').val();

    desc = '<div>' + desc + '</div>';
    descHtml = $(desc);
    $(descHtml).each(function () {
      $(this).find('img').each(function () {
        $(this).addClass('img');
        $(this).addClass('img-responsive');
      });
    });

    return descHtml.prop('outerHTML');
  };

  $scope.createEvent = function () {
    $scope.event.desc = $scope.getDescription();
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
    $scope.event.desc = $scope.getDescription();

    if (!$scope.event.name || $scope.event.name.length < 1 || $scope.event.name > 20) {
      Notifications.error($('#header'), 'Name should not be empty and should not be longer than 20 characters');
      return;
    }
    $scope.event = Events.update({eventId: $scope.event.id}, $scope.event, function () {
      window.location.reload();
    });
  }
}]);