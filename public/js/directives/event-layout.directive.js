app.directive('eventLayout', ['Global', '$compile', function (Global, $compile) {

  var getVisibilityText = function (visibility) {
    switch (visibility) {
      case 'public': return 'Event is visible to everyone';
      case 'followers': return 'Event is visible to your followers';
      case 'invitations': return 'Event is visible only to invited users';
    }
  };

  var getAttendanceText = function (attendance) {
    switch (attendance) {
      case 'public': return 'Everyone can attend this event';
      case 'followers': return 'Only your followers can attend this event';
      case 'invitations': return 'Only invited people can attend this event';
    }
  };

  var fillUpDetails = function ($scope, element) {
    return function () {
      $(element).find('.description').each(function () {
        $(this).append($scope.event.desc);
      });

      $(element).find('.event-visibility').each(function () {
        $(this).text(getVisibilityText($scope.event.permissions.visibility));
      });

      $(element).find('.event-attendance').each(function () {
       $(this).text(getAttendanceText($scope.event.permissions.attendance));
      });

      $(element).find('.attendance-btn').each(function () {
        if ($scope.controller.eventId === 'new' || Global.me.id === $scope.event.organizator.id) return $(this).html('');

        if (event.attending) {
          $(this).addClass('col-lg-6 col-lg-offset-3 col-xs-6 col-xs-offset-3');
          $(this).find('button').text('I will not go');
          $scope.attendButtonAction = $scope.controller.quitEvent;
        } else {
          $scope.attendButtonAction = $scope.controller.attendEvent;
          $(this).find('button').each(function () {
            $(this).addClass('btn-success col-lg-12 col-xs-12');
            $(this).text('I will go');
          });
        }
      });

      if ($scope.controller.eventId === 'new') return $scope.edit(true);
    };
  };

  var edit = function ($scope, element) {
    return function (isNew) {
      $scope.title = '';
      $scope.controller.deletedEventName = '';

      $(element).find('.content').each(function () {
        $(this).hide();
      });
      $(element).find('.invitation-btn').each(function () {
        $(this).hide();
      });
      $(element).find('.show-people-btn').each(function () {
        $(this).hide();
      });
      $(element).find('.edit-btn').each(function () {
        $(this).hide();
      });
      $(element).find('.xs-menu-tabs').each(function () {
        $(this).hide();
      });
      $scope.view = 'description';

      $scope.getVisibilityText = getVisibilityText;
      $scope.getAttendanceText = getAttendanceText;

      $(element).find('.description').each(function () {
        $(this).html('');
        $(this).append('<div class="form-group col-lg-10"><textarea class="form-control"></textarea></div>');
        $(this).find('textarea').each(function () {
          if (!isNew) $(this).val($scope.event.desc);
          $(this).wysihtml5();
        });
      });
      $(element).find('.title').each(function () {
        var editableParams = [
          'editable-text="event.name"',
          'e-placeholder="Type event name"'
        ].join(' ');

        $(this).html(
          $compile('<a href="#" class="editable" ' + editableParams + '>{{event.name || "Type event name"}}</a>')($scope)
        );
      });
      $(element).find('.event-visibility').each(function () {
        $(this).parent().removeClass('text-grey');

        $scope.visibilities = [{
          value: 'public',
          text: getVisibilityText('public')
        }, {
          value: 'followers',
          text: getVisibilityText('followers')
        }, {
          value: 'invitations',
          text: getVisibilityText('invitations')
        }];

        var editableParams = [
          'editable-select="event.permissions.visibility"',
          'e-ng-options="v.value as v.text for v in visibilities"'
        ].join(' ');

        $(this).html(
          $compile('<a href="#" class="editable" ' + editableParams + '> {{getVisibilityText(event.permissions.visibility)}} </a>')($scope)
        );
      });

      $(element).find('.event-attendance').each(function () {
        $scope.attendencies = [{
          value: 'public',
          text: getAttendanceText('public')
        }, {
          value: 'followers',
          text: getAttendanceText('followers')
        }, {
          value: 'invitations',
          text: getAttendanceText('invitations')
        }];

        var editableParams = [
          'editable-select="event.permissions.attendance"',
          'e-ng-options="a.value as a.text for a in attendencies"'
        ].join(' ');

        $(this).html(
          $compile('<a href="#" class="editable" ' + editableParams + '> {{getAttendanceText(event.permissions.attendance)}} </a>')($scope)
        );
      });

      $(element).find('.event-date').each(function () {
        $(this).find('p').hide();

        $(this).append(
          $compile('<a data-toggle="modal", data-target="#dateAndTimePicker" href="#" class="big-text editable" >{{event.date.format("Do MMMM YYYY")}}, {{event.date.format("HH:mm")}}</a>')($scope)
        );
      });
      $(element).find('.event-location > a').each(function () {
        $(this).addClass('editable');
      });

      var eventTime = $scope.controller.now.format('HH:mm');
      if (!isNew && $scope.event.date) eventTime = $scope.event.date.format('HH:mm');

      $('.clockpicker').clockpicker();
      $('.clockpicker').find('input').attr('value', eventTime);
      $('.clockpicker').find('input').change(function () {
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

        $scope.$apply();
      });

      if (!isNew) {
        $(element).find('.edit-btn-group').each(function () {
          $(this).removeClass('hide');
        });
      } else {
        $(element).find('.create-btn-group').each(function () {
          $(this).removeClass('hide');
        });
      }

    };
  };

  return {
    templateUrl: '/view/eventUserLayout.html',
    scope: {
      event: "=event"
    },
    link: function ($scope, element, attrs) {
      $scope.controller = $scope.$parent;
      $scope.edit = edit($scope, element);
      $scope.global = Global;

      if (Global.screenSize === 'lg') {
        $(element).find('#sticked').addClass('affix affix-top');
        $scope.view = 'comments';
      } else {
        $scope.view = 'description';
      }

      $scope.detailsTemplate = '/view/eventDetails.html';
      $scope.thumbnail = $scope.event.picture || '/img/event_logo.jpg';
      $scope.header = $scope.event.headerPicture || '/img/event_background.png';
      $scope.title = $scope.event.name;
      $scope.fillUpDetails = fillUpDetails($scope, element);
      if ($scope.controller.eventId === 'new') return;

      $scope.canEdit = Global.me.id === $scope.event.organizator.id;

      $scope.showPeopleAccepted = $scope.controller.showPeopleAccepted;
      $scope.showPeopleInvited = $scope.controller.showPeopleInvited;

      $scope.showDescription = function () {
        if ($scope.view === 'description') return;
        $scope.view = 'description';
        $(element).find('#descriptionTab').addClass('active');
        $(element).find('#commentsTab').removeClass('active');
        $(element).find('#peopleTab').removeClass('active');
      };
      $scope.showComments = function () {
        if ($scope.view === 'comments') return;
        $scope.view = 'comments';
        $(element).find('#commentsTab').addClass('active');
        $(element).find('#descriptionTab').removeClass('active');
        $(element).find('#peopleTab').removeClass('active');
      };
      $scope.showPeople = function () {
        if ($scope.view === 'people') return;
        $scope.view = 'people';
        $(element).find('#peopleTab').addClass('active');
        $(element).find('#descriptionTab').removeClass('active');
        $(element).find('#commentsTab').removeClass('active');
      };
    }
  };
}]);