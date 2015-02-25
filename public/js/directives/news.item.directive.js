app.directive('newsItem', ['Global', '$compile', function (Global, $compile) {
  var pictureCode = function (itemType, item) {
    return '<div picture item-type="' + itemType + '" type="avatar" item="' + item + '" class="img img-circle"></div>';
  }
  return {
    scope: {
      action: '=item'
    },
    templateUrl: '/view/action.html',
    link: function ($scope, element, attrs) {
      var contentHTML;
      var subjectHref;
      var subjectName;
      var objectHref;
      var objectName;

      var action = $scope.action;

      switch (action.subject[0]._type) {
        case 'User' : {
          $scope.subject = action.subject[0].userId;
          $(element).find('#subjectThumbnail').each(function () {
            $(this).html($compile(pictureCode('user', 'subject'))($scope));
          });
          subjectHref = '/users/' + $scope.subject.username;
          subjectName = $scope.subject.username;
          break;
        }
        case 'Event' : {
          $scope.subject = action.subject[0].eventId;
          subjectHref = '/events/' + $scope.subject.id;
          subjectName = $scope.subject.name;
          $(element).find('#subjectThumbnail').each(function () {
            $(this).html($compile(pictureCode('event', 'subject'))($scope));
          });
          break;
        }
      }

      switch (action._type) {
        case Global.actionTypes.signup: {
          objectHref = '/app';

          contentHTML = [
            '<a href="' + subjectHref + '"><b>' + subjectName + '</b></a>,',
            'welcome to Eventorio!'
          ].join(' ');
          break;
        }

        case Global.actionTypes.createEvent: {
          $scope.object = action.object[0].eventId;
          objectHref = '/events/' + $scope.object.id;
          $(element).find('#objectThumbnail').each(function () {
            $(this).html($compile(pictureCode('event', 'object'))($scope));
          });
          contentHTML = [
            '<a href="' + subjectHref + '"><b>' + subjectName + '</b></a>',
            'has created'
          ];

          contentHTML.push('the event');
          contentHTML.push('"<a href="' + objectHref + '"><b>' + $scope.object.name + '</b></a>"');

          contentHTML = contentHTML.join(' ');
          break;
        }

        case Global.actionTypes.invite: {
          var subjectEvent = action.subject[0].eventId;
          var subjectUser = action.subject[0].userId;

          $scope.object = action.object[0].userId;

          objectHref = '/users/' + $scope.object.username;
          objectName = $scope.object.username;

          $(element).find('#objectThumbnail').each(function () {
            $(this).html($compile(pictureCode('user', 'object'))($scope));
          });
          contentHTML = [
            '<a href="/users/' + subjectUser.username + '"><b>' + subjectUser.username + '</b></a>',
            'invited'
          ];
          contentHTML.push('<a href="/users/' + objectName + '"><b>' + objectName + '</b></a>');
          contentHTML.push('<a href="/events/' + subjectEvent._id + '"><b>@' + subjectEvent.name + '</b></a>');

          contentHTML = contentHTML.join(' ');

          break;
        }

        case Global.actionTypes.attendEvent: {
          $scope.object = action.object[0].eventId;

          objectName = $scope.object.name;
          $(element).find('#objectThumbnail').each(function () {
            $(this).html($compile(pictureCode('event', 'object'))($scope));
          });
          contentHTML = [
            '<a href="' + subjectHref + '"><b>' + subjectName + '</b></a>',
            'will participate'
          ];

          contentHTML.push('<a href="/events/' + $scope.object.id + '"><b>@' + objectName + '</b></a>');
          contentHTML = contentHTML.join(' ');
          break;
        }

        case Global.actionTypes.quitEvent: {
          $scope.object = action.object[0].eventId;

          objectHref = '/events/' + $scope.object.id;
          objectName = $scope.object.name;

          $(element).find('#objectThumbnail').each(function () {
            $(this).html($compile(pictureCode('event', 'object'))($scope));
          });
          contentHTML = [
            '<a href="' + subjectHref + '"><b>' + subjectName + '</b></a>',
            'will not participate'
          ];

          contentHTML.push('<a href="' + objectHref + '"><b>@' + objectName + '</b></a>');
          contentHTML = contentHTML.join(' ');
          break;
        }

        case Global.actionTypes.follow: {
          $scope.object = action.object[0].userId;

          objectHref = '/users/' + $scope.object.username;
          objectName = $scope.object.username;
          $(element).find('#objectThumbnail').each(function () {
            $(this).html($compile(pictureCode('user', 'object'))($scope));
          });
          contentHTML = [
            '<a href="' + subjectHref + '"><b>' + subjectName + '</b></a>',
            'is now following'
          ];

          contentHTML.push('<a href="' + objectHref + '"><b>@' + objectName + '</b></a>');
          contentHTML = contentHTML.join(' ');
          break;
        }

        case Global.actionTypes.referenced: {
          $scope.object = action.object[0].userId;

          objectHref = '/users/' + $scope.object.username;
          objectName = $scope.object.username;

          $(element).find('#objectThumbnail').each(function () {
            $(this).html($compile(pictureCode('user', 'object'))($scope));
          });
          contentHTML = [
            '<a href="' + subjectHref + '"><b>' + subjectName + '</b></a>',
            'mentionned',
            '<a href="' + objectHref + '"><b>@' + objectName + '</b></a>',
            'in his comment',
            '<a href="/events/' + action.subject[0].eventId._id + '"><b>@' + action.subject[0].eventId.name + '</b></a>'
          ];

          contentHTML = contentHTML.join(' ');
          break;
        }
      }

      $(element).find('#actionContent').html(contentHTML);
    },
  }
}]);