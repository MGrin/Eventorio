app.controller('EventController', ['$scope', '$rootScope', 'Global', 'Users', 'Events', 'Notifications', 'Comments',
  function ($scope, $rootScope, Global, Users, Events, Notifications, Comments) {
  $scope.global = Global;
  $scope.now = moment();
  $scope.isNew = window.location.href.indexOf('new') >= 0;

  $scope.view = 'description';
  $scope.peopleView = 'accepted';

  $scope.stickyParams = {
    topLimit: 75,
    topOffset: 5
  };

  Events.updateMonthlyList($scope.now, function (err, events) {
    $rootScope.$broadcast('day', $scope.now, _.filter(events, function (event) {
      return moment(event.date).format('YYYYMMDD') === $scope.now.format('YYYYMMDD');
    }));
  });

  $scope.$on('event:update:header', function (info, img) {
    $scope.event.headerPicture = img;
    $scope.$apply();
  });

  $scope.$on('event:update:avatar', function (info, img) {
    $scope.event.picture = img;
    $scope.$apply();
  });

  $scope.$on('me', function () {
    if (!$scope.event) {
      $scope.event = Events.get({eventId: window.location.pathname.split('/')[2]}, function () {
        $scope.setEditable(false);
        $scope.event.date = moment($scope.event.date);
        $scope.event.comments = Comments.get({eventId: window.location.pathname.split('/')[2]});
        $scope.event.people = Events.people.get({eventId: $scope.event.id}, function () {
          $scope.event.people.accepted.push($scope.event.organizator);
          $scope.attending = (_.findWhere($scope.event.people.accepted, {id: Global.me.id})) ? true : false;
          $scope.$broadcast('currentEvent');
        });
        $scope.show = true;
      });
    } else {
      // Loading the event creation page
      $scope.setEditable(true);
      $scope.show = true;
    }
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

  $scope.cancel = function () {
    Events.removeTemporaryEvent($scope.event, function (err) {
      if (err) return Notifications.error($('.event-thumbnail'), err);
      if (!$scope.isNew) {
        window.location.reload();
      } else {
        window.location.href = app.path.dashboard;
      }
    });

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
          window.location.pathname = app.path.dashboard;
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

  $scope.modifyEvent = function () {
    $scope.event.desc = $scope.getDescription();

    if (!$scope.event.name || $scope.event.name.length < 1 || $scope.event.name > 20) {
      Notifications.error($('.event-thumbnail'), 'Name should not be empty and should not be longer than 20 characters');
      return;
    }

    if ($scope.event.id) {
      Events.update({eventId: $scope.event.id}, $scope.event, function (data) {
        data.comments = $scope.event.comments;
        data.people = $scope.event.people;
        data.date = moment(data.date);

        $scope.event = data;
        $scope.setEditable(false);
      });
    } else {
      var event = new Events($scope.event);
      event.$save(function (data) {
        window.location.href = '/events/' + data.id;
      });
    }

  }

  $scope.visibilities = [
    {value: 'public', text: 'Event is visible to everyone'},
    {value: 'followers', text: 'Event is visible only to your followers'},
    {value: 'invitations', text: 'Event is visible only to invited people'}
  ];

  $scope.showVisibility = function () {
    if (!$scope.event.permissions.visibility) return $scope.visibilities[0].text;
    return _.find($scope.visibilities, function (el) {
      return el.value === $scope.event.permissions.visibility;
    }).text;
  };

  $scope.updateVisibility = function (data) {
    $scope.event.permissions.visibility = data;
  }

  $scope.attendencies = [
    {value: 'public', text: 'Everyone can attend this event'},
    {value: 'followers', text: 'Only your followers can attend this event'},
    {value: 'invitations', text: 'Only invited people can attend this event'}
  ];

  $scope.showAttendance = function () {
    if (!$scope.event.permissions.attendance) return $scope.attendencies[0].text;
    return _.find($scope.attendencies, function (el) {
      return el.value === $scope.event.permissions.attendance;
    }).text;
  };

  $scope.updateAttendance = function (data) {
    $scope.event.permissions.attendance = data;
  }

  $scope.setEditable = function (status) {
    if (status) {
      $scope.mode = 'Edit';
      $scope.view='description';

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
        else $scope.event.date = moment($scope.event.date).year(date.year()).month(date.month()).date(date.date());
      });

      $('textarea.eventDescriptionField').html($scope.event.desc);
      $('textarea.eventDescriptionField.wysihtml5').wysihtml5();
    } else {
      $scope.mode = 'Normal';
    }
  }
}]);