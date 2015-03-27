app.directive('eventPage', ['$window', 'Global', 'Pictures', function ($window, Global, Pictures) {
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
          margin = -avatarHeight/2;
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

      // XS uplaod process
      var cleanFileAvatarXS = function () {
        element.find('#event-avatar-modal input[type="text"]').each(function () {
          $(this).val();
          $(this).addClass('.empty');
        });
      }

      var handleAvatarUpload = function (evt) {
        var file = evt.currentTarget.files[0];
        if (file.type.split('/')[0] !== 'image') {
          $scope.newAvatarPicture = null;
          cleanFileAvatarXS();
          return $scope.headerAvatarError = 'File is not an image!';
        }
        element.find('#event-avatar-modal > input[type="text"]').each(function () {
          $(this).removeClass('empty');
          $(this).val(file.name);
        });
        $scope.newAvatarPicture = file;
        $scope.avatarIsUploading = true;

        Pictures.uploadAvatarForEvent(file, $scope.event, function (err, img) {
          if (err) return growl.error(err);
          $scope.event.picture = img;
          $scope.avatarIsUploading = false;
          $scope.$apply();
          cleanFileAvatarXS();
          $('#event-avatar-modal').modal('hide');
        });
      }
      element.on('change', '#avatar-img-upload', handleAvatarUpload);

      var progress = 0;
      var direction = -1;
      var delta = 10;

      var updateAvatarUpdateProgress = function () {
        if (!$scope.avatarIsUploading) return;
        element.find('#event-avatar-modal .progress-bar').each(function () {
          $(this).css('width', progress + '%');
          if (progress === 100 || progress === 0) direction *= -1;
          progress += direction * delta;
        });
        if ($scope.avatarIsUploading) setTimeout(updateAvatarUpdateProgress, 50);
      };

      $scope.$watch('avatarIsUploading', function (newV, oldV) {
        if (newV) updateAvatarUpdateProgress();
      });
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
      /**
       * View stuff
       */
      $scope.participantsView = 'accepted';
      $scope.$watch('participantsView', function (newVal, oldVal) {
        if (newVal === oldVal) return;
        switch (newVal) {
          case 'accepted' : {
            $('#event-participants-modal #accepted-btn').addClass('btn-raised');
            $('#event-participants-modal #accepted-btn').removeClass('btn-flat');
            $('#event-participants-modal #invited-btn').addClass('btn-flat');
            $('#event-participants-modal #invited-btn').removeClass('btn-raised');
            break;
          }
          case 'invited' : {
            $('#event-participants-modal #accepted-btn').removeClass('btn-raised');
            $('#event-participants-modal #accepted-btn').addClass('btn-flat');
            $('#event-participants-modal #invited-btn').removeClass('btn-flat');
            $('#event-participants-modal #invited-btn').addClass('btn-raised');
            break;
          }
        }
      });
      $('#event-participants-modal').on('hidden.bs.modal', function () {
        $scope.participantsView = 'accepted';
      });

      $scope.visibilities = [
        {value: 'public', text: 'Visible to everyone'},
        {value: 'followers', text: 'Visible to your followers'},
        {value: 'invitations', text: 'Visible only to invited people'},
      ];
      $scope.showVisibility = function () {
        return _.find($scope.visibilities, function (v) {
          return v.value === $scope.event.permissions.visibility;
        }).text;
      };

      $scope.attendancies = [
        {value: 'public', text: 'Everyone can attend'},
        {value: 'followers', text: 'Only followers can attend'},
        {value: 'invitations', text: 'Only invited users can attend'},
      ];
      $scope.showAttendance = function () {
        return _.find($scope.attendancies, function (a) {
          return a.value === $scope.event.permissions.attendance;
        }).text;
      };

      $scope.showDate = function (date) {
        date = moment(date);
        return date.format('DD MMMM YYYY, HH:mm');
      };

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