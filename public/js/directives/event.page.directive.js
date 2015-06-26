'use strict';

app.directive('customOnChange', function() { // jshint ignore:line
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.customOnChange);
      element.bind('change', onChangeHandler);
    }
  };
});

app.directive('eventPage', ['$window', 'Global', 'Pictures', 'growl', function ($window, Global, Pictures, growl) { // jshint ignore:line
  return {
    link: function ($scope, element) {
////////////////////////////////////////////////////////////////////////////////////////////////////
      /**
       * Event logo and most important details visual fixes
       */
      var setupDetailsMargin = function () {
        var avatarHeight = 0;
        element.find('.event-avatar-picture').each(function () {
          avatarHeight = $(this).height();
        });
        if (avatarHeight < 100) return setTimeout(setupDetailsMargin, 250);
        var margin;
        if ($scope.editmode) {
          if (Global.screenSize === 'xs') {
            margin = 0;
          } else {
            margin = -avatarHeight - 50;
          }
        } else {
          if (Global.screenSize === 'xs') {
            margin = -avatarHeight/2;
          } else {
            margin = -avatarHeight;
          }
        }

        element.find('#event-details').each(function () {
          $(this).css({
            'margin-top': margin
          });
        });
      };

      $scope.$watch('editmode', function () {
        setupDetailsMargin();
      });
      setupDetailsMargin();
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
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

      $scope.$on('header:uploading:start', function () {
        loadingHeader(true);
      });
      $scope.$on('header:uploading:stop', function () {
        loadingHeader(false);
      });

      $scope.showHeaderPictureChooser = function () {
        $('#headerFileInput').click();
      };
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
      /**
       * Event logo upload fixes
       */
      $scope.$watch('editmode', function (newV) {
        if (newV) {
          $('cropme').each(function () {
            var parent = $(this).parent();
            $(this).css('margin-left', parent.width()/2);
          });
        }
      });
      $scope.$on('cropme:loaded', function () {
        $('#cropme-ok').addClass('btn btn-material-light-green');
      });
      $scope.$on('cropme:done', function (info, result) {
        // Remove all previously uploaded pictures in the edit mode
        if ($scope.event.picture !== $scope.event.originalPicture) {
          Pictures.remove($scope.event.id || 'temp', 'avatar', $scope.event.picture, function (err) {
            if (err) growl.error('Failed to remove your old avatar. Do not worry =)');
          });
        }
        Pictures.upload(result.croppedImage, $scope.event.id, 'avatar', function (err, name) {
          if (err || !name) {
            growl.error('Failed to upload event\'s avatar');
            return;
          }

          $scope.event.picture = name;
          $scope.$apply();
          $('#event-avatar-modal').modal('hide');
          $scope.$broadcast('cropme:cancel');
        });
      });

      $scope.showAvatarPictureChooser = function () {
        $('#avatarFileInput').click();
      };
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
      /**
       * View stuff
       */
      $scope.showDate = function (date) {
        date = moment(date); // jshint ignore:line
        return date.format('DD MMMM YYYY, HH:mm');
      };

////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
      /**
       * Errors showing
       */
      $scope.$on('event:save:error', function (info, errors) {
        _.each(errors, function (err) { // jshint ignore:line
          showError(err);
        });
      });

      var showError = function (error) {
        if (typeof error === 'string') return growl.error(error);
        if (typeof error === 'object') return growl.error('Error in ' + error.field + ': ' + error.message);
      };
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
      $('#stripe-checkout').click(function (e) {
        $scope.stripe.open({
          name: $scope.event.name + '@Eventorio',
          description: $scope.purchasingTicket.name + ', ' + $scope.purchasingTicket.price + 'CHF.-',
          currency: 'chf',
          amount: $scope.purchasingTicket.price*100
        });
        e.preventDefault();
      });

      $(window).on('popstate', function() {
        $scope.stripe.close();
      });


      $scope.$on('stripe:closed', function () {

      });
      $scope.$on('stripe:purchased', function () {
        
      });
    }
  };
}]);
