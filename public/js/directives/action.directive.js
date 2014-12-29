app.directive('action', ['Global', function (Global) {
  return {
    scope: {
      action: '=item'
    },
    templateUrl: '/view/action.html',
    link: function ($scope, element, attrs) {
      $(element).find('#actionTimestamp').text(moment($scope.action.created).format('MMMM Do YYYY, HH:mm:ss'));

      $(element).find('#actionImg').attr('src', $scope.action.subject[0].userId.picture);
      $(element).find('#actionImgLink').attr('href', '/users/'+ $scope.action.subject[0].userId.username);
      $(element).find('#subjectLink').attr('href', '/users/' + $scope.action.subject[0].userId.username);
      $(element).find('#subjectName').text($scope.action.subject[0].userId.username + ' ');

      $(element).find('#secondActionImg').css('height', '100px');
      $(element).find('#secondActionImg').css('margin-top', '10px');

      var contentHtml;
      var secondImgSrc;
      var secondImgHref;

      switch($scope.action._type) {
        case 'signup': {
          contentHtml = [
            '<b><a href="/users/' + $scope.action.subject[0].userId.username + '">',
            $scope.action.subject[0].userId.username,
            '</a></b>',
            ', welcome to Eventorio!'
          ].join('');
          secondImgSrc = '/img/logo_white_on_blue.png';
          break;
        };
        case 'create event': {
          contentHtml = [
            '<b><a href="/users/' + $scope.action.subject[0].userId.username + '">',
            $scope.action.subject[0].userId.username,
            '</a></b>',
            ' has created new event ',
            '<b><a href="/events/' + $scope.action.object[0].eventId.id + '">',
            '"' + $scope.action.object[0].eventId.name + '"',
            '</a></b>'
          ].join('');

          secondImgSrc = $scope.action.object[0].eventId.picture || '/img/event_logo.jpg';
          secondImgHref = "/events/" + $scope.action.object[0].eventId.id;
          break;
        };
        case 'invite': {
          contentHtml = [
            '<b><a href="/users/' + $scope.action.subject[0].userId.username + '">',
            $scope.action.subject[0].userId.username,
            '</a></b>',
            ' is invited ',
            '<b><a href="/events/' + $scope.action.object[0].eventId.id + '">',
            '@' + $scope.action.object[0].eventId.name,
            '</a></b>'
          ].join('');

          secondImgSrc = $scope.action.object[0].eventId.picture || '/img/event_logo.jpg';
          secondImgHref = "/events/" + $scope.action.object[0].eventId.id;
          break;
        };
        case 'attend event': {
          contentHtml = [
            '<b><a href="/users/' + $scope.action.subject[0].userId.username + '">',
            $scope.action.subject[0].userId.username,
            '</a></b>',
            ' will participate ',
            '<b><a href="/events/' + $scope.action.object[0].eventId.id + '">',
            '@' + $scope.action.object[0].eventId.name,
            '</a></b>'
          ].join('');

          secondImgSrc = $scope.action.object[0].eventId.picture || '/img/event_logo.jpg';
          secondImgHref = "/events/" + $scope.action.object[0].eventId.id;
          break;
        };
        case 'quit event': {
          contentHtml = [
            '<b><a href="/users/' + $scope.action.subject[0].userId.username + '">',
            $scope.action.subject[0].userId.username,
            '</a></b>',
            ' will not participate ',
            '<b><a href="/events/' + $scope.action.object[0].eventId.id + '">',
            '@' + $scope.action.object[0].eventId.name,
            '</a></b>'
          ].join('');

          secondImgSrc = $scope.action.object[0].eventId.picture || '/img/event_logo.jpg';
          secondImgHref = "/events/" + $scope.action.object[0].eventId.id;
          break;
        };
        case 'follow': {
          contentHtml = [
            '<b><a href="/users/' + $scope.action.subject[0].userId.username + '">',
            $scope.action.subject[0].userId.username,
            '</a></b>',
            ' is now following ',
            '<b><a href="/events/' + $scope.action.object[0].userId.username + '">',
            $scope.action.object[0].userId.username,
            '</a></b>'
          ].join('');

          secondImgSrc = $scope.action.object[0].userId.picture;
          secondImgHref = "/users/" + $scope.action.object[0].userId.username;
          break;
        };
      }

      $(element).find('#secondActionImg').attr('src', secondImgSrc);
      if (secondImgHref) $(element).find('#secondActionImgLink').attr('href', secondImgHref);
      $(element).find('#actionContent').html(contentHtml);
    },
  }
}]);