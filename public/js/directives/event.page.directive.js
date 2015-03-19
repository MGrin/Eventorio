app.directive('eventPage', ['Global', 'Pictures', function (Global, Pictures) {
  return {
    link: function ($scope, element, attrs) {
////////////////////////////////////////////////////////////////////////////////////////////////////
      /**
       * Event logo and most important details visual fixes
       */
      var setupDetailsMargin = function () {
        var avatarHeight = 0;
        element.find('.event-avatar-picture').each(function () {
          avatarHeight = $(this).height();
        });
        if (avatarHeight < 10) return setTimeout(setupDetailsMargin, 250);
        var margin;
        if (Global.screenSize !== 'xs') {
          margin = -avatarHeight;
        } else {
          margin = -avatarHeight/2;
        }
        element.find('#event-details').each(function () {
          $(this).css({
            'margin-top': margin
          });
        });
      }
      $scope.$watch('editmode', function(newVal) {
        if (!newVal) {
          setupDetailsMargin();
        } else {
          element.find('#event-details').each(function () {
            $(this).css({
              'margin-top': 0
            });
          });
        }
      });
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
      /**
       * Header image upload fixes
       */
      var cleanFile = function () {
        element.find('#header-upload-well input[type="text"]').each(function () {
          $(this).val();
          $(this).addClass('.empty');
        });
      }

      var handleHeaderUpload = function (evt) {
        var file = evt.currentTarget.files[0];
        if (file.type.split('/')[0] !== 'image') {
          $scope.newHeaderPicture = null;
          cleanFile();
          return $scope.headerUploadError = 'File is not an image!';
        }
        element.find('#header-upload-well > input[type="text"]').each(function () {
          $(this).removeClass('empty');
          $(this).val(file.name);
        });
        $scope.newHeaderPicture = file;
        $scope.headerIsUploading = true;

        Pictures.uploadHeaderForEvent(file, $scope.event, function (err, img) {
          if (err) return growl.error(err);
          $scope.event.headerPicture = img;
          $scope.headerIsUploading = false;
          $scope.$apply();
        });
      }
      element.on('change', '#header-img-upload', handleHeaderUpload);

      var progress = 0;
      var direction = -1;
      var delta = 10;

      var updateHeaderUpdateProgress = function () {
        if (!$scope.headerIsUploading) return;
        element.find('#header-upload-well .progress-bar').each(function () {
          $(this).css('width', progress + '%');
          if (progress === 100 || progress === 0) direction *= -1;
          progress += direction * delta;
        });
        if ($scope.headerIsUploading) setTimeout(updateHeaderUpdateProgress, 50);
      };

      $scope.$watch('headerIsUploading', function (newV, oldV) {
        if (newV) updateHeaderUpdateProgress();
      });
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
        Pictures.uploadAvatarForEvent(result.croppedImage, $scope.event, function (err, img) {
          if (err) return showError(err);
          $scope.event.picture = img;
          $scope.$apply();
          $('#event-avatar-modal').modal('hide');
        });
      });
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
      /**
       * Errors showing
       */
      $scope.$on('event:save:error', function (info, errors) {
        _.each(errors, function (err) {
          showError(err);
        });
      });

      var showError = function (error) {
        if (typeof error === 'string') return growl.error(error);
        if (typeof error === 'object') return growl.error('Error in ' + error.field + ': ' + error.message);
      }
////////////////////////////////////////////////////////////////////////////////////////////////////
    }
  }
}]);