app.directive('comment', ['Global', function (Global) {
  return {
    scope: {
      comment: '=item'
    },
    templateUrl: '/view/comment.html',
    link: function ($scope, element, attrs) {
      $(element).find('#userLink').attr('href', '/users/' + $scope.comment.creator.username);
      $(element).find('#userImg').attr('src', $scope.comment.creator.picture);
      $(element).find('#username').text($scope.comment.creator.username);

      var contentSplit = $scope.comment.content.split(' ');
      var resContent = [];
      _.each(contentSplit, function (word) {
        var temp = word.match(/@[a-zA-Z0-9]+/);
        if (temp) {
          var username = temp[0].substring(1);
          word = word.substring(0, temp.index)
                  + '<b><a href="/users/' + username + '">@' + username + '</a></b>'
                  + word.substring(temp.index + username.length + 1);
        }
        resContent.push(word);
      });
      $(element).find('#content').html(resContent.join(' '));
      $(element).find('#commentTimestamp').text(moment($scope.comment.created).format('MMMM Do YYYY, HH:mm:ss'));
    },
  }
}]);