'use strict';

app.directive('customOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.customOnChange);
      element.bind('change', onChangeHandler);
    }
  };
});

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

      $scope.showHeaderPictureChooser = function () {
        $('#headerFileInput').click();
      };

      var headerIsLoading = false;
      var progress = 0;
      var direction = -1;
      var delta = 1;

      var headerLoading = $('#headerLoading');
      var progressBar = headerLoading.find('.progress');

      var loadingHeader = function (state) {
        headerIsLoading = state;
        if (!headerIsLoading) return headerLoading.addClass('hide');

        headerLoading.removeClass('hide');
        var updateProgress = function () {
          progressBar.css('width', progress + '%');
          if (progress === 100 || progress === 0) direction *= -1;
          progress += direction * delta;

          if (headerIsLoading) setTimeout(updateProgress, 50);
        };
        updateProgress();
      };

      $scope.$on('header:uploading:start', function (info) {
        loadingHeader(true);
      });
      $scope.$on('header:uploading:stop', function (info) {
        loadingHeader(false);
      });
    },
  };
}]);
