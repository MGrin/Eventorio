app.directive('eventLine', ['Global', function (Global) {
  return {
    scope: {
      event: '=event'
    },
    templateUrl: '/view/eventLine.html',
    link: function ($scope, element, attrs) {
      $(element).find('#eventLink').attr('href', '/events/' + $scope.event.id);
      $(element).find('#eventPicture').attr('src', $scope.event.picture || '/img/event_logo.jpg');
      $(element).find('#eventName').text($scope.event.name);
      $(element).find('#eventTime').text($scope.event.readableTime)
      $(element).find('#eventOrganizatorLink').attr('href', '/users/' + $scope.event.organizator.username);
      $(element).find('#eventOrganizatorName').text($scope.event.organizator.username);
    },
  }
}]);