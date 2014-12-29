app.directive('comment', ['Global', function (Global) {
  return {
    scope: {
      comment: '=item'
    },
    templateUrl: '/view/comment.html',
    link: function ($scope, element, attrs) {
      $(element).find('#userLink').attr('href', '/users/' + $scope.comment.creator.username);
      $(element).find('#userImg').attr('src', $scope.comment.creator.picture);
      $(element).find('#content').html($scope.comment.content);
      $(element).find('#commentTimestamp').text(moment($scope.comment.created).format('MMMM Do YYYY, HH:mm:ss'));
    },
  }
}]);