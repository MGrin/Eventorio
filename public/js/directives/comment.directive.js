app.directive('comment', ['Global', '$compile', function (Global, $compile) {
  return {
    scope: {
      comment: '=item'
    },
    link: function ($scope, element, attrs) {
      if (!$scope.comment.content) return $(element).addClass('hide');

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
      $(element).find('.comment-content').html(resContent.join(' '));
    },
  }
}]);