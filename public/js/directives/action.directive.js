app.directive('action', ['Global', function (Global) {
  return {
    scope: {
      action: '=item'
    },
    templateUrl: '/view/action.html',
    link: function ($scope, element, attrs) {
      var objectImgSrc;
      var objectImgLinkHref;
      var objectName;

      var subjectImgSrc;
      var subjectImgLinkHref;
      var subjectName;

      var contentHTML;

      var action = $scope.action;

      var subject;
      var object;

      switch (action.subject[0]._type) {
        case 'User' : {
          subject = action.subject[0].userId;

          subjectImgSrc = subject.picture;
          subjectImgLinkHref = '/users/' + subject.username;
          subjectName = subject.username;

          break;
        }
        case 'Event' : {
          subject = action.subject[0].eventId;

          subjectImgSrc = subject.picture || '/img/event_logo.jpg';
          subjectImgLinkHref = '/events/' + subject.id;
          subjectName = subject.name;
          break;
        }
      }

      switch (action._type) {
        case Global.actionTypes.signup: {
          objectImgSrc = '/img/logo_white_on_blue.png';
          objectImgLinkHref = '/app';
          objectName = 'Eventorio';

          contentHTML = [
            '<a href="' + subjectImgLinkHref + '"><b>' + subjectName + '</b></a>,',
            'welcome to Eventorio!'
          ].join(' ');
          break;
        }

        case Global.actionTypes.createEvent: {
          object = action.object[0].eventId;

          objectImgSrc = object.picture;
          objectImgLinkHref = '/events/' + object.id;
          objectName = object.name;

          contentHTML = [
            '<a href="' + subjectImgLinkHref + '"><b>' + subjectName + '</b></a>',
            'has created'
          ];

          contentHTML.push('the event');
          contentHTML.push('"<a href="' + objectImgLinkHref + '"><b>' + objectName + '</b></a>"');

          contentHTML = contentHTML.join(' ');
          break;
        }

        case Global.actionTypes.invite: {
          var subjectEvent = action.subject[0].eventId;
          var subjectUser = action.subject[0].userId;

          object = action.object[0].userId;

          objectImgSrc = object.picture;
          objectImgLinkHref = '/users/' + object.username;
          objectName = object.username;

          contentHTML = [
            '<a href="/users/' + subjectUser.username + '"><b>' + subjectUser.username + '</b></a>',
            'invited'
          ];
          contentHTML.push('<a href="/users/' + action.object[0].userId.username + '"><b>' + action.object[0].userId.username + '</b></a>');
          contentHTML.push('<a href="/events/' + subjectEvent.id + '"><b>@' + subjectEvent.name + '</b></a>');

          contentHTML = contentHTML.join(' ');

          break;
        }

        case Global.actionTypes.attendEvent: {
          object = action.object[0].eventId;

          objectImgSrc = object.picture;
          objectImgLinkHref = '/events/' + object.id;
          objectName = object.name;

          contentHTML = [
            '<a href="' + subjectImgLinkHref + '"><b>' + subjectName + '</b></a>',
            'will participate'
          ];

          contentHTML.push('<a href="' + objectImgLinkHref + '"><b>@' + objectName + '</b></a>');
          contentHTML = contentHTML.join(' ');
          break;
        }

        case Global.actionTypes.quitEvent: {
          object = action.object[0].eventId;

          objectImgSrc = object.picture;
          objectImgLinkHref = '/events/' + object.id;
          objectName = object.name;

          contentHTML = [
            '<a href="' + subjectImgLinkHref + '"><b>' + subjectName + '</b></a>',
            'will not participate'
          ];

          contentHTML.push('<a href="' + objectImgLinkHref + '"><b>@' + objectName + '</b></a>');
          contentHTML = contentHTML.join(' ');
          break;
        }

        case Global.actionTypes.follow: {
          object = action.object[0].userId;

          objectImgSrc = object.picture;
          objectImgLinkHref = '/users/' + object.username;
          objectName = object.username;

          contentHTML = [
            '<a href="' + subjectImgLinkHref + '"><b>' + subjectName + '</b></a>',
            'is now following'
          ];

          contentHTML.push('<a href="' + objectImgLinkHref + '"><b>@' + objectName + '</b></a>');
          contentHTML = contentHTML.join(' ');
          break;
        }

        case Global.actionTypes.referenced: {
          object = action.object[0].userId;

          objectImgSrc = object.picture;
          objectImgLinkHref = '/users/' + object.username;
          objectName = object.username;

          contentHTML = [
            '<a href="' + subjectImgLinkHref + '"><b>' + subjectName + '</b></a>',
            'mentionned',
            '<a href="' + objectImgLinkHref + '"><b>@' + objectName + '</b></a>',
            'in his comment',
            '<a href="/events/' + action.subject[0].eventId._id + '"><b>@' + action.subject[0].eventId.name + '</b></a>'
          ];

          contentHTML = contentHTML.join(' ');
          break;
        }
      }

      $(element).find('#actionTimestamp').text(moment($scope.action.created).format('MMMM Do YYYY, HH:mm:ss'));

      $(element).find('#subjectImg').attr('src', subjectImgSrc);
      $(element).find('#subjectImgLink').attr('href', subjectImgLinkHref);
      $(element).find('#subjectName').text(subjectName);

      $(element).find('#objectImg').attr('src', objectImgSrc);
      $(element).find('#objectImgLink').attr('href', objectImgLinkHref);
      $(element).find('#objectName').text(objectName);

      $(element).find('#actionContent').html(contentHTML);

      $scope.objectImgSrc = objectImgSrc;
      // $scope.$apply();
    },
  }
}]);