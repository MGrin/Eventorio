app.directive('imgUploadCover', ['Pictures', 'Notifications', function (Pictures, Notifications) {
  return {
    scope: {
      isVisible: '=isVisible',
      item: '='
    },
    template: '<cropme width="' + app.config.img.cover.width + '" height="' + app.config.img.cover.height +
                '" destination-width="' + app.config.img.cover.width +
                '" destination-height="' + app.config.img.cover.height + '" type="png"></cropme>' +
              '<button class="btn btn-default btn-lg" ng-click="cancel()">Cancel</button>' +
              '<div class="cropme-loading hide text-center"><h1>Uploading</h1></div>',
    link: function ($scope, element, attrs) {
      $scope.itemType = attrs.itemType;
      $scope.pictureType = attrs.pictureType;
      var cropmeMargin = ($(window).width() - app.config.img.cover.width)/2;
      if (cropmeMargin > 0) {
        $(element).css('margin-left', cropmeMargin + 'px');
        $('#cover-btn-group').css('right', (cropmeMargin + 10) + 'px');
      }

      element.find('#cropme-cancel').each(function () {
        $(this).css('display', 'none');
      });
      element.find('#cropme-ok').each(function () {
        $(this).addClass('cropme-btn btn btn-success btn-lg');
        $(this).text('Upload');
      });

      element.find('.cropme-loading').each(function () {
        $(this).css({
          'width': '100%',
          'height': '100%',
          'position': 'absolute',
          'top': 0,
          'left': 0,
          'background-color': 'rgba(255,255,255,0.6)'
        });
        $(this).html('<h1>Uploading</h1>');
      });

      $scope.cancel = function () {
        $scope.$broadcast("cropme:cancel");
      }

      $scope.$on('cropme:loaded', function () {
        $scope.isLoaded = true;
      });

      $scope.$on('cropme:cancel', function () {
        $scope.isVisible = false;
      });

      $scope.$on('cropme:done', function (e, image) {
        if ($scope.isVisible) {
          var blob = image.croppedImage;
          element.find('#cropme-loading').each(function () {
            $(this).removeClass('hide');
          });

          if ($scope.itemType === 'user') {
            Pictures.uploadHeaderForUser(blob, $scope.item, function (err, img) {
              if (err) return Notifications.error($(element), err);
              $scope.cancel();
              $scope.$apply();
              $scope.$emit('user:update:header', img);
              element.find('#cropme-loading').each(function () {
                $(this).addClass('hide');
              });
              $scope.isVisible = false;
            });
          } else if ($scope.itemType === 'event') {
            Pictures.uploadHeaderForEvent(blob, $scope.item, function (err, img) {
              if (err) return Notifications.error($(element), err);
              $scope.cancel();
              $scope.$apply();
              $scope.$emit('event:update:header', img);
              element.find('#cropme-loading').each(function () {
                $(this).addClass('hide');
              });
              $scope.isVisible = false;
            });
          }
        }
      });
    }
  }
}]);

app.directive('imgUploadAvatar', ['Pictures', 'Notifications', function (Pictures, Notifications) {
  return {
    scope: {
      isVisible: '=isVisible',
      item: '='
    },
    template: '<cropme width="' + app.config.img.avatar.width + '" height="' + app.config.img.avatar.height +
                '" destination-width="' + app.config.img.avatar.width +
                '" destination-height="' + app.config.img.avatar.height + '" type="png"></cropme>' +
                '<div class="cropme-loading hide text-center"><h1>Uploading</h1></div>',
    link: function ($scope, element, attrs) {
      $scope.itemType = attrs.itemType;

      var parentWidth = $(element).parent().parent().parent().width();
      var cropmeMargin = (parentWidth - app.config.img.avatar.width)/2 - 10;
      if (cropmeMargin > 0) {
        $(element).css('margin-left', cropmeMargin + 'px');
        $(element).css('margin-right', cropmeMargin + 'px');
      }

      element.find('#cropme-cancel').each(function () {
        $(this).css('display', 'none');
      });
      element.find('#cropme-ok').each(function () {
        $(this).addClass('cropme-btn btn btn-success');
        $(this).text('Upload');
      });

      element.find('.cropme-loading').each(function () {
        $(this).css({
          'width': '100%',
          'height': '100%',
          'position': 'absolute',
          'top': 0,
          'left': 0,
          'background-color': 'rgba(255,255,255,0.6)'
        });
        $(this).html('<h1>Uploading</h1>');
      });

      $scope.cancel = function () {
        $scope.$broadcast("cropme:cancel");
      }

      $scope.$on('cropme:loaded', function () {
        $scope.isLoaded = true;
      });

      $scope.$on('cropme:cancel', function () {
        $scope.isVisible = false;
      });

      $scope.$on('cropme:done', function (e, image) {
        if ($scope.isVisible) {
          var blob = image.croppedImage;
          element.find('#cropme-loading').each(function () {
            $(this).removeClass('hide');
          });

          if ($scope.itemType === 'event') {
            Pictures.uploadAvatarForEvent(blob, $scope.item, function (err, img) {
              if (err) return Notifications.error($(element), err);

              $scope.cancel();
              $scope.$apply();
              $scope.$emit('event:update:avatar', img);
              element.find('#cropme-loading').each(function () {
                $(this).addClass('hide');
              });
              $scope.isVisible = false;
              $('#picturePicker').modal('toggle');
            });
          }
        }
      });
    }
  }
}]);