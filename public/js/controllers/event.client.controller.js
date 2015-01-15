app.controller('EventController', ['$scope', '$rootScope', 'Global', 'Users', 'Events', 'Notifications', 'Comments',
  function ($scope, $rootScope, Global, Users, Events, Notifications, Comments) {
  $scope.global = Global;
  $scope.now = moment();
  $scope.deletedEventName = '';

  $scope.eventId = window.location.pathname.split('/')[2].toLowerCase();
  if ($scope.eventId !== 'new') {
    $scope.event = Events.get({eventId: window.location.pathname.split('/')[2]}, function () {
      $scope.show = true;

      $scope.originalName = $scope.event.name;

      $scope.event.date = moment($scope.event.date);

      $scope.event.comments = Comments.get({eventId: window.location.pathname.split('/')[2]});
      $scope.event.people = Events.people.get({eventId: $scope.event.id}, function () {
        $scope.event.people.accepted.push($scope.event.organizator);
        $scope.event.attending = (_.findWhere($scope.event.people.accepted, {id: Global.me.id})) ? true : false;
      });
    });
  } else {
    $scope.event = {
      organizator : Global.me,
      name: null,
      desc: null,
      date: moment(),
      permissions: {
          visibility: "public",
          attendance: "public"
      },
      picture: '/img/event_logo.jpg',
      headerPicture: '/img/event_background.png'
    }
    $scope.show = true;
  }

  $scope.peopleView = 'accepted';

  $scope.showPeopleAccepted = function () {
    if ($scope.peopleView === 'accepted') return;
    $scope.peopleView = 'accepted';
    $('.peopleAcceptedTab').addClass('active');
    $('.peopleInvitedTab').removeClass('active');
  };

  $scope.showPeopleInvited = function () {
    if ($scope.peopleView === 'invited') return;
    $scope.peopleView = 'invited';
    $('.peopleInvitedTab').addClass('active');
    $('.peopleAcceptedTab').removeClass('active');
  };

  $scope.attendEvent = function () {
    if ($scope.event.attending) return;
    Events.attend($scope.event, function (err) {
      $scope.event.people.accepted.push(Global.me);
      $scope.event.people.invited = _.without($scope.event.people.invited,
                                              _.findWhere(
                                                $scope.event.people.invited,
                                                {id: Global.me.id}
                                              )
                                            );
      $scope.event.attending = true;
    });
  }

  $scope.quitEvent = function () {
    if (!$scope.event.attending) return;
    Events.quit($scope.event, function (err) {
      $scope.event.people.invited.push(Global.me);
      $scope.event.people.accepted = _.without($scope.event.people.accepted,
                                                _.findWhere(
                                                  $scope.event.people.accepted,
                                                  {id: Global.me.id}
                                                )
                                              );
      $scope.event.attending = false;
    });
  }

  $scope.invite = function () {
    $('#emailsToInvite').removeClass('has-error');
    $('#emailsToInvite label').text('');

    var text = $('#emailsToInvite textarea').val();
    if (!text || text === '') {
      $('#emailsToInvite').addClass('has-error');
      $('#emailsToInvite label').text('Please enter at least one email');
      return;
    }

    text = text.replace(/\s/g, '');
    var emails = text.split(',');

    $('#invitationModal').toggle();
    Events.invite(emails, $scope.event, function (err) {
      if (err) {
        Notifications.error($('#header'), err);
      }
    });
  };

  $scope.deleteEvent = function() {
      if(deletedEventName === $scope.originalName){
          Events.remove($scope.event, function(err) {
            if(!err){
                $('#deleteModal').toggle();
                window.location.pathname = "/";
            }
          });
      }
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

    var comment = new Comments({content: $(commentHtml).prop('outerHTML'), event: $scope.event});
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
    if (Global.screenSize === 'lg') {
      $('#rightSidebar .description textarea').each(function () {
        desc = $(this).val();
      });
    } else if (Global.screenSize === 'xs') {
      $('.visible-xs .description textarea').each(function () {
        desc = $(this).val();
      });
    }
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
      Notifications.error($('#error'), 'Name should not be empty and should not be longer than 20 characters');
      return;
    }
    var event = new Events($scope.event);

    event.$save(function (res) {
      window.location.pathname = "/events/" + res.id;
    }, function (res) {
      Notifications.error($('#error'),res.data);
    });
  }

  $scope.editEvent = function () {
    $scope.event.desc = $scope.getDescription();

    if (!$scope.event.name || $scope.event.name.length < 1 || $scope.event.name > 20) {
      Notifications.error($('#error'), 'Name should not be empty and should not be longer than 20 characters');
      return;
    }

    $scope.event = Events.update({eventId: $scope.event.id}, $scope.event, function () {
      window.location.reload();
    });
  }

  $scope.cancel = function () {
    if ($scope.eventId === 'new') {
      return history.back();
    }
    return window.location.reload();
  }
}]);