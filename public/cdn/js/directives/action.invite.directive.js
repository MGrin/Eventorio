app.directive('inviteAction', ['Global', function (Global) {
  return {
    scope: {
      action: '=action'
    },
    templateUrl: '/view/actions/invite.html',
    link: function ($scope, element, attrs) {
      $(element).find('#actionTimestamp').text(moment($scope.action.created).format('MMMM Do YYYY, HH:mm:ss'));
      $(element).find('#actionImg').attr('src', $scope.action.object[0].userId.picture);
      $(element).find('#subjectLink').attr('href', '/events/' + $scope.action.subject[0].eventId.id);
      $(element).find('#subjectName').text(' @' + $scope.action.subject[0].eventId.name);
      $(element).find('#objectLink').attr('href', '/users/' + $scope.action.object[0].userId.username);
      $(element).find('#objectName').text($scope.action.object[0].userId.username + ' ');
      $(element).find('#secondActionImg').css('height', '100px');
      $(element).find('#secondActionImg').css('margin-top', '10px');
      $(element).find('#secondActionImg').attr('src',
          $scope.action.subject[0].eventId.picture || '/img/event_logo.jpg');
    },
  }
}]);