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
        Pictures.upload(result.croppedImage, $scope.event, 'avatar', function (err, img) {
          if (err) return showError(err);
          $scope.event.picture = img;
          $scope.$apply();
          $('#event-avatar-modal').modal('hide');
        });
      });

      // XS uplaod process
      var cleanFileAvatarXS = function () {
        element.find('#event-avatar-modal input[type="text"]').each(function () {
          $(this).val();
          $(this).addClass('.empty');
        });
      };

      var handleAvatarUpload = function (evt) {
        var file = evt.currentTarget.files[0];
        if (file.type.split('/')[0] !== 'image') {
          $scope.newAvatarPicture = null;
          cleanFileAvatarXS();
          $scope.headerAvatarError = 'File is not an image!';

          return;
        }
        element.find('#event-avatar-modal > input[type="text"]').each(function () {
          $(this).removeClass('empty');
          $(this).val(file.name);
        });
        $scope.newAvatarPicture = file;
        $scope.avatarIsUploading = true;

        Pictures.upload(file, $scope.event, 'avatar', function (err, img) {
          if (err) return growl.error(err);
          $scope.event.picture = img;
          $scope.avatarIsUploading = false;
          $scope.$apply();
          cleanFileAvatarXS();
          $('#event-avatar-modal').modal('hide');
        });
      };
      element.on('change', '#avatar-img-upload', handleAvatarUpload);

      var updateAvatarUpdateProgress = function () {
        if (!$scope.avatarIsUploading) return;
        element.find('#event-avatar-modal .progress-bar').each(function () {
          $(this).css('width', progress + '%');
          if (progress === 100 || progress === 0) direction *= -1;
          progress += direction * delta;
        });
        if ($scope.avatarIsUploading) setTimeout(updateAvatarUpdateProgress, 50);
      };

      $scope.$watch('avatarIsUploading', function (newV) {
        if (newV) updateAvatarUpdateProgress();
      });
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
    }
  };
}]);
