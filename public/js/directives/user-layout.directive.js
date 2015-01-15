app.directive('userLayout', ['Global', '$compile', function (Global, $compile) {

  var contentHTML = '<p ng-if="user.events.length===0" class="text-center text-grey big-text-lg">No upcoming events.</p>' +
                    '<div ng-if="user.events.length>0" class="user-events col-lg-6 col-xs-12" ng-repeat="event in user.events" event-line event="event"></div>';

  var fillUpDetails = function ($scope, element) {
    return function () {
      $(element).find('.annotation').each(function () {
        if ($scope.controller.editable) {
          var editableParams = [
            'editable-text="user.name"',
            'e-placeholder="Enter your name"',
            'onbeforesave="controller.updateUser(\'name\', $data)"'
          ].join(' ');

          $(this).append(
            $compile(
              '<a href="#" class="editable" ' +
              editableParams +
              '>{{user.name || "Enter your name"}}</a>')($scope)
          );
        } else {
          $(this).append('<span class="text-grey">No name</span>');
        }
      });

      $(element).find('.description').each(function () {
        if ($scope.controller.editable) {
          var editableParams = [
            'editable-text="user.desc"',
            'e-cols="40"',
            'e-placeholder="Describe yourself!"',
            'buttons="no"',
            'onbeforesave="controller.updateUser(\'desc\', $data)"'
          ].join(' ');

          $(this).append(
            $compile(
              '<a href="#" class="editable" ' +
              editableParams +
              '>{{user.desc || "Describe yourself!"}}</a>')($scope)
          );
        }
      });

      if (Global.screenSize === 'xs') {
        $(element).find('.content').each(function () {
          $(this).html($compile(contentHTML)($scope));
        });
      }
    };
  };

  return {
    templateUrl: '/view/eventUserLayout.html',
    scope: {
      user: "=user"
    },
    link: function ($scope, element, attrs) {
      if (Global.screenSize === 'lg') {
        $(element).find('#sticked').addClass('affix');
        $(element).find('#sticked').addClass('affix-top');
        $(element).find('.content').each(function () {
          $(this).html($compile(contentHTML)($scope));
        });
      }

      $scope.controller = $scope.$parent;
      $scope.fillUpDetails = fillUpDetails($scope, element);

      $scope.detailsTemplate = '/view/userDetails.html';
      $scope.thumbnail = $scope.user.picture;
      $scope.header = $scope.user.headerPicture || '/img/user_background.png';
      $scope.title = $scope.user.username;
    }
  };
}]);