'use strict';

app.directive('userProfile', ['Global', function (Global) { // jshint ignore:line
  return {
    link: function ($scope, element) {
      var setupDetailsMargin = function () {
        var avatarHeight = 0;
        element.find('.user-avatar-picture').each(function () {
          avatarHeight = $(this).height();
        });
        if (avatarHeight < 10) return setTimeout(setupDetailsMargin, 250);
        element.find('#user-details').each(function () {
          $(this).css({
            'margin-top': -avatarHeight/2
          });
        });
      };

      if (Global.screenSize !== 'xs') setupDetailsMargin();

      $('#user-settings-modal').on('hidden.bs.modal', function () {
          $scope.settings.visible.password = false;
          $scope.settings.visible.additionalInfo = false;
          $scope.$apply();
      });

      $scope.settings = {
        visible: {
          password: false,
          additionalInfo: false
        }
      };

      $scope.eventsView = 'organized';
      if ($scope.editable) $scope.eventsView = 'participated';

      $scope.$on('user:events', function (info, events) {
        if (!$scope.editable || ($scope.editable && events.participated.length === 0)) $scope.eventsView = 'organized';
        else if ($scope.editable && events.participated.length > 0)$scope.eventsView = 'participated';
        addActiveClassToEventView();
      });

      var addActiveClassToEventView = function () {
        if ($scope.eventsView === 'organized') {
          $('#nav-tickets').removeClass('active');
          $('#nav-organized').addClass('active');
        }

        if ($scope.eventsView === 'participated') {
          $('#nav-tickets').addClass('active');
          $('#nav-organized').removeClass('active');
          console.log(2);
        }
      };
      $scope.switchEventsView = function (newView) {
        if ($scope.eventsView === newView) return;
        $scope.eventsView = newView;
        addActiveClassToEventView();
      };
    },
  };
}]);
