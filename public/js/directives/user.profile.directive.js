app.directive('userProfile', ['Global', function (Global) {
  return {
    link: function ($scope, element, attrs) {
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
      }

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
        element.find('#header-upload-well input[type="text"]').each(function () {
          $(this).removeClass('empty');
          $(this).val(file.name);
        });
        $scope.newHeaderPicture = file;
        $scope.$apply();
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
      if (Global.screenSize !== 'xs') setupDetailsMargin();
    },
  }
}]);