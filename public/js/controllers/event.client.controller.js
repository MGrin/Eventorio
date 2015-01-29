app.controller('EventController', ['$scope', '$rootScope', 'Global', 'Users', 'Events', 'Notifications', 'Comments',
  function ($scope, $rootScope, Global, Users, Events, Notifications, Comments) {
  $scope.global = Global;
  $scope.now = moment();

  $scope.view = 'description';
  $scope.peopleView = 'accepted';

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

      if ($scope.mode === 'Normal') {
        $scope.event.comments = Comments.get({eventId: window.location.pathname.split('/')[2]});
        $scope.event.people = Events.people.get({eventId: $scope.event.id}, function () {
          $scope.event.people.accepted.push($scope.event.organizator);
          $scope.attending = (_.findWhere($scope.event.people.accepted, {id: Global.me.id})) ? true : false;
          $scope.$broadcast('currentEvent');
        });
      }
    });
  });

  $scope.showDescription = function () {
    if ($scope.view === 'description') return;
    $scope.view = 'description';
  };
  $scope.showComments = function () {
    if ($scope.view === 'comments') return;
    $scope.view = 'comments';
  };
  $scope.showPeople = function () {
    if ($scope.view === 'people') return;
    $scope.view = 'people';
  };

  $scope.showPeopleAccepted = function () {
    if ($scope.peopleView === 'accepted') return;
    $scope.peopleView = 'accepted';
  };

  $scope.showPeopleInvited = function () {
    if ($scope.peopleView === 'invited') return;
    $scope.peopleView = 'invited';
  };

  $scope.getImgThumbnailTop = function () {
    var headerMargin = parseInt($('#header').css('margin-top'));
    return $('.img-event-header').height() + $('#header').height() + headerMargin - 120;
  }

  $scope.goBack = function () {
    window.history.back();
  }
  $scope.cancel = function () {
    window.location.reload();
  }

  $scope.attendTheEvent = function () {
    if ($scope.attending) return;
    Events.attend($scope.event, function (err) {
      $scope.event.people.accepted.push(Global.me);
      $scope.event.people.invited = _.without($scope.event.people.invited,
                                              _.findWhere(
                                                $scope.event.people.invited,
                                                {id: Global.me.id}
                                              )
                                            );
      $scope.attending = (_.findWhere($scope.event.people.accepted, {id: Global.me.id}))?true:false;
    });
  }

  $scope.quitTheEvent = function () {
    Events.quit($scope.event, function (err) {
      $scope.event.people.invited.push(Global.me);
      $scope.event.people.accepted = _.without($scope.event.people.accepted,
                                                _.findWhere(
                                                  $scope.event.people.accepted,
                                                  {id: Global.me.id}
                                                )
                                              );
      $scope.attending = (_.findWhere($scope.event.people.accepted, {id: Global.me.id}))?true:false;
    });
  }

  $scope.deleteEvent = function() {
      var input = $('#eventNameToDelete textarea').val();
      if(input === $scope.event.name){
          Events.remove($scope.event, function(err) {
            if(!err){
                $('#deleteModal').toggle();
                window.location.pathname = "/";
            }
          });
      }
  };

  $scope.comment = function (newComment) {
    if (!newComment || newComment === '') return;

    var comment = new Comments({content: newComment, event: $scope.event});
    comment.$save(function (res) {
      $scope.event.comments.comments.push(res);
    }, function (res) {
      if (Global.screenSize === 'lg') {
        Notifications.error($('.event-comments .form .error-field'), res.data);
      } else if (Global.screenSize === 'xs') {
        Notifications.error($('.event-comments .form-inline .error-field'), res.data);
      }
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
      Notifications.error($('.event-thumbnail'), 'Name should not be empty and should not be longer than 20 characters');
      return;
    }

    var event = new Events($scope.event);

    event.$save(function (res) {
      window.location.pathname = "/events/" + res.id;
    }, function (res) {
      Notifications.error($('.event-thumbnail'),res.data);
    });
  }

  $scope.modifyEvent = function () {
    $scope.event.desc = $scope.getDescription();

    if (!$scope.event.name || $scope.event.name.length < 1 || $scope.event.name > 20) {
      Notifications.error($('.event-thumbnail'), 'Name should not be empty and should not be longer than 20 characters');
      return;
    }

    $scope.event = Events.update({eventId: $scope.event.id}, $scope.event, function () {
      window.location.reload();
    });
  }

  $scope.setEditable = function (status, mode) {
    if (status) {
      $scope.mode = mode;
      if (mode === 'Create') {
        var creationDate = $scope.date?moment($scope.date):moment();
        creationDate.hours($scope.now.hours()).minutes($scope.now.minutes());
        $scope.event = {
          date: creationDate,
          visibility: 'public',
          attendance: 'public',
          location: {}
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
      $('textarea.eventDescriptionField').wysihtml5();
    } else {
      $scope.mode = 'Normal';
    }
  }
}]);