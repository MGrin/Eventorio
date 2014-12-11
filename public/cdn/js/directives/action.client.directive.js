app.directive('actionDirective', ['Global', function (Global) {
  return {
    scope: {
      action: '=action'
    },
    template: '<div class="panel panel-info">' +
              '<div class="panel-body"></div>' +
              '<div class="panel-footer text-right"></div>' +
              '</div>',
    link: function ($scope, element, attrs) {
      $(element)
        .find('.panel-footer')
        .html('<small>' + moment($scope.action.created).format('MMMM Do YYYY, HH:mm:ss') + '</small>');

      switch($scope.action._type) {
        case Global.actionTypes.signup: {
          $(element)
            .find('.panel-body')
            .html('<a href="/users/' + $scope.action.subject[0].userId.username + '"><b>' +
                  $scope.action.subject[0].userId.username + '</b></a>, welcome to Eventorio!');
          break;
        }

        case Global.actionTypes.createEvent: {
          $(element)
            .find('.panel-body')
            .html('<a href="/users/' + $scope.action.subject[0].userId.username + '"><b>' +
                  $scope.action.subject[0].userId.username + '</b></a> has created new event "' +
                  '<a href="/events/' + $scope.action.object[0].eventId.id + '"><b>' +
                  $scope.action.object[0].eventId.name + '</b></a>"');
          break;
        }

        case Global.actionTypes.attendEvent: {
          $(element)
            .find('.panel-body')
            .html('<a href="/users/' + $scope.action.subject[0].userId.username + '"><b>' +
                  $scope.action.subject[0].userId.username + '</b></a> will participate "' +
                  '<a href="/events/' + $scope.action.object[0].eventId.id + '"><b>@' +
                  $scope.action.object[0].eventId.name + '</b></a>"');
          break;
        }

        case Global.actionTypes.quitEvent: {
          $(element)
            .find('.panel-body')
            .html('<a href="/users/' + $scope.action.subject[0].userId.username + '"><b>' +
                  $scope.action.subject[0].userId.username + '</b></a> will not participate "' +
                  '<a href="/events/' + $scope.action.object[0].eventId.id + '"><b>@' +
                  $scope.action.object[0].eventId.name + '</b></a>"');
          break;
        }

        case Global.actionTypes.invite: {
          $(element)
            .find('.panel-body')
            .html('<a href="/users/' + $scope.action.object[0].userId.username + '"><b>' +
                  $scope.action.object[0].userId.username + '</b></a> is invited ' +
                  '<a href="/events/' + $scope.action.subject[0].eventId.id + '"><b>@' +
                  $scope.action.subject[0].eventId.name + '</b></a> by ' +
                  '<a href="/users/' + $scope.action.subject[0].userId.username + '"><b>' +
                  $scope.action.subject[0].userId.username + '</b></a>');
          break;
        }

        case Global.actionTypes.follow: {
          $(element)
            .find('.panel-body')
            .html('<a href="/users/' + $scope.action.subject[0].userId.username + '"><b>' +
                  $scope.action.subject[0].userId.username + '</b></a> is now following "' +
                  '<a href="/users/' + $scope.action.object[0].userId.username + '"><b>@' +
                  $scope.action.object[0].userId.username + '</b></a>"');
          break;
        }
      }
    },
  }
}]);