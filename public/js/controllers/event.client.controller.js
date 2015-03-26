app.controller('EventController', ['$scope', '$rootScope', 'Global', 'Users', 'Events', 'growl', 'Comments',
  function ($scope, $rootScope, Global, Users, Events, growl, Comments) {
  $scope.global = Global;
  $scope.now = moment();
  $scope.isNew = window.location.href.indexOf('new') >= 0;
  $scope.editmode = $scope.isNew;

  $scope.states = {
    me: false,
    participants: false
  };

  $scope.calendar = {
    events: []
  };

  $scope.invitations = {
    emails: null,
    followers: []
  };

  $scope.$on('day', function (info, day, events) {
    if (!$scope.event.date) $scope.event.date = moment();

    $scope.event.date.year(day.year());
    $scope.event.date.month(day.month());
    $scope.event.date.date(day.date());

    $scope.calendar.events = events;

    $scope.$apply();
  });

  $scope.$on('clockpicker:time', function (info, hours, minutes) {
    if (!$scope.event.date) $scope.event.date = moment();

    $scope.event.date.hour(hours);
    $scope.event.date.minute(minutes);

    $scope.$apply();
  });

  Events.updateMonthlyList($scope.now, function (err, events) {
    if (err) return growl.error(err);
    $rootScope.$broadcast('monthlyEvents', events);
    $scope.calendar.events = _.filter(events, function (event) {
      return moment(event.date).format('YYYYMMDD') === $scope.now.format('YYYYMMDD');
    });
  });

  var filterFollowersToInvite = function () {
    var invitedFollowers = _.filter($scope.event.organizator.followers, function (follower) {
      var followerInAccepted = _.find($scope.event.participants.accepted, function (fol) {
        return fol.id === follower.id;
      }) ? true : false;
      var followerInInvited = _.find($scope.event.participants.invited, function (fol) {
        return fol.id === follower.id;
      }) ? true : false;

      return followerInAccepted || followerInInvited;
    });

    $scope.followersToInvite = _.difference($scope.event.organizator.followers, invitedFollowers);
    $scope.followersToInvite = _.map($scope.followersToInvite, function (follower) {
      follower.isVisible = true;
      return follower;
    });
  };

  $scope.initEvent = function (event) {
    if ($scope.isNew && !event.tempId) return growl.error('Error!');

    async.series([
      function (next) {
        $scope.event = $scope.fixEvent(event);
        return next();
      },
      function (next) {
        var setupOrganizator = function () {
          $scope.isEditable = (Global.me.id === $scope.event.organizator.id);
          if ($scope.isEditable) {
            var eventorioFollower = _.find(Global.me.followers, function (follower) {
              return follower.username === 'Eventorio';
            });

            $scope.event.organizator.followers = _.without(Global.me.followers, eventorioFollower);
          }
          $scope.states.me = true;
        };

        if (Global.me) {
          setupOrganizator();
          return next();
        }
        $scope.$on('me', function () {
          setupOrganizator();
          return next();
        });
      }, function (next) {
        $scope.event.participants = Events.participants.get({eventId: $scope.event.id}, function () {
          $scope.event.isAttending = (_.find($scope.event.participants.accepted, function (us) {
            return us.id === Global.me.id;
          })) ? true : false;
          $scope.states.participants = true;

          return next();
        });
      }, function (next) {
        filterFollowersToInvite();
        $scope.$watch('invitations.search', function (newQuery, oldQuery) {
          if (newQuery === oldQuery) return;
          if (!newQuery) {
            $scope.followersToInvite = _.map($scope.followersToInvite, function (follower) {
              follower.isVisible = true;
              return follower;
            });
          }
          var queryRE = new RegExp(newQuery);
          $scope.followersToInvite = _.map($scope.followersToInvite, function (follower) {
            if (follower.username.match(queryRE) || (follower.name && follower.name.match(queryRE))) {
              follower.isVisible = true;
            } else {
              follower.isVisible = false;
            }
            return follower;
          });
        });
        return next();
      }
    ], function () {
      console.log(event);
    });
  };

  $scope.fixEvent = function (event) {
    if (event.date) event.date = moment(event.date);
    event.canBeAttended = event.canBeAttended && !event.date.isBefore(moment());
    return event;
  };

  $scope.toggleInvitation = function (user) {
    if (!$scope.isChoosedToBeInvited(user)) {
      $scope.invitations.followers.push(user);
      user.isChoosed = true;
    } else {
      $scope.invitations.followers = _.without($scope.invitations.followers, user);
      user.isChoosed = false;
    }
  };

  $scope.isChoosedToBeInvited = function (user) {
    return _.find($scope.invitations.followers, function (follower) {
      return follower.id === user.id;
    }) ? true : false;
  };

  $scope.invite = function () {
    if (!$scope.invitations.emails && $scope.invitations.followers.length === 0) return;

    var emails = [];
    if ($scope.invitations.emails) {
      emails = _.filter($scope.invitations.emails.split(','), function (email) {
        return email.trim();
      });
    }

    Events.invite(emails, $scope.invitations.followers, $scope.event, function (err) {
      if (err) return growl.error(err);

      _.each($scope.invitations.followers, function (follower) {
        $scope.event.participants.invited.push(follower);
      });
      filterFollowersToInvite();
      $scope.invitations.emails = null;
      $scope.invitations.followers = [];
      $scope.invitations.search = '';
    });
  };

  $scope.attend = function () {
    var newAttendee = new Events.participants($scope.event);
    newAttendee.$save();
    $scope.event.isAttending = true;
    var meInInvited = _.find($scope.event.participants.invited, function (us) {
      return us.id === Global.me.id
    }) || Global.me;
    $scope.event.participants.accepted.push(meInInvited);
    $scope.event.participants.invited = _.without($scope.event.participants.invited, meInInvited);
  };

  $scope.quit = function () {
    Events.participants.remove($scope.event, function (err) {
      if (err) return growl.error(err);
      $scope.event.isAttending = false;
      var meInAccepted = _.find($scope.event.participants.accepted, function (us) {
        return us.id === Global.me.id
      }) || Global.me;
      $scope.event.participants.accepted = _.without($scope.event.participants.accepted, meInAccepted);
      $scope.event.participants.invited.push(meInAccepted);
    });
  };

  $scope.save = function () {
    var errors = $scope.validate($scope.event);

    if (errors) return $scope.$broadcast('event:save:error', errors);

    if ($scope.isNew) {
      var event = new Events($scope.event);
      event.$save(function (event) {
        window.location.href='/events/' + event.id;
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
    if ($scope.isNew) return window.location.href = app.path.dashboard;
    $scope.editmode = false;
  };

  $scope.cancelLogo = function () {
    $scope.$broadcast('cropme:cancel');
  };

  $scope.validate = function (event) {
    var errors = [];
    var nameError = app.validator.validateEventName(event.name);
    var dateError = app.validator.validateEventDate(event.date);
    var venueError = app.validator.validateEventVenue(event.venue);

    if (nameError) errors.push({field: 'name', message: nameError});
    if (dateError) errors.push({field: 'date', message: dateError});
    if (venueError) errors.push({field: 'venue', message: venueError});

    return errors.length === 0 ? null : errors;
  };

  $scope.enterEditMode = function () {
    $scope.editmode = true;
  };

  $scope.visibilities = [
    {value: 'public', text: 'Visible to everyone'},
    {value: 'followers', text: 'Visible to your followers'},
    {value: 'invitations', text: 'Visible only to invited people'},
  ];
  $scope.showVisibility = function () {
    return _.find($scope.visibilities, function (v) {
      return v.value === $scope.event.permissions.visibility;
    }).text;
  };

  $scope.attendancies = [
    {value: 'public', text: 'Everyone can attend'},
    {value: 'followers', text: 'Only followers can attend'},
    {value: 'invitations', text: 'Only invited users can attend'},
  ];
  $scope.showAttendance = function () {
    return _.find($scope.attendancies, function (a) {
      return a.value === $scope.event.permissions.attendance;
    }).text;
  };
}]);