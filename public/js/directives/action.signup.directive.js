app.directive('signupAction', ['Global', function (Global) {
  return {
    scope: {
      action: '=action'
    },
    templateUrl: '/view/actions/signup.html',
    link: function ($scope, element, attrs) {
      $(element).find('#actionImg').attr('src', $scope.action.subject[0].userId.picture);
      $(element).find('#actionImgLink').attr('href', '/users/' + $scope.action.subject[0].userId.username);
      $(element).find('#subjectLink').attr('href', '/users/' + $scope.action.subject[0].userId.username);
      $(element).find('#subjectLink').html('<b>' + $scope.action.subject[0].userId.username + '</b>');
      $(element).find('#actionTimestamp').text(moment($scope.action.created).format('MMMM Do YYYY, HH:mm:ss'));
      $(element).find('#secondActionImg').css('height', '100px');
      $(element).find('#secondActionImg').css('margin-top', '10px');
      $(element).find('#secondActionImg').attr('src', '/img/logo_white_on_blue.png');
    },
  }
}]);