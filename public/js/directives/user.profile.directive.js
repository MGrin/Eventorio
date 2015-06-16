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
    },
  };
}]);
