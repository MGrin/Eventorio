'use strict';

app.controller('UserController', ['$scope', '$rootScope', 'Global', 'Users', 'growl', 'Pictures', // jshint ignore:line
  function ($scope, $rootScope, Global, Users, growl, Pictures) { // jshint ignore:line
  $scope.global = Global;
  $scope.changePasswordView = false;

  $scope.user = app.profile; // jshint ignore:line

  if (!Global.me) {
    $scope.editable = false;
  } else {
    if (Global.me.id === $scope.user.id) $scope.editable = true;
  }

  var eventsQuery = {
    organizator: $scope.user.id
  };

  if ($scope.editable) eventsQuery.participant = $scope.user.id;

  Users.queryEvents(eventsQuery, function (err, events) {
    if (err) return growl.error(err);

    $scope.user.events = events;
    $scope.$broadcast('user:events', events);
  });

  $scope.credentials = {
    oldPassword: '',
    newPassword: '',
    newPasswordRepeat: ''
  };

  $scope.changePassword = function () {
    Users.changePassword(Global.me, $scope.credentials, function (err) {
      if (err) {
        $scope.credentials.error = err;
        return;
      }

      $scope.settings.visibility.password = false;
      $scope.credentials = {
        oldPassword: '',
        newPassword: '',
        newPasswordRepeat: '',
        error: null
      };
      growl.info('Password successfully changed!');
    });
  };


  $scope.userBirthday = $scope.user.birthday ? new Date($scope.user.birthday) : new Date(1992, 0, 1);

  $scope.updateUserAdditionalInformation = function () {
    $scope.user.birthday = $scope.userBirthday; // jshint ignore:line
    $scope.updateUser();

    $scope.userBirthday = $scope.user.birthday;
    $scope.settings.visible.additionalInfo = false;
  };

  $scope.updateUser = function (cb) {
    var events = $scope.user.events;

    Users.update({_id: $scope.user.id, user: $scope.user}, function (user) {
      user.events = events;
      $scope.user = user;
      if (cb) return cb();
    });
  };

  $scope.uploadHeader = function(event){
    var files = event.target.files;
    if (!files.length === 0) return 
    if (files.length > 1) return growl.error('You can not upload more than one header image!');

    var picture = files[0];

    var err = app.validator.validateImageExt(picture);
    if (err) return growl.error(err);

    $scope.$broadcast('header:uploading:start');

    if ($scope.user.headerPicture) {
      Pictures.remove($scope.user.id, 'header', $scope.user.headerPicture, function (err) {
        if (err) growl.error("Failed to remove your old header. Do not worry =)");
      });
    }
    Pictures.upload(picture, $scope.user.id, 'header', function (err, name) {
      if (err || !name) {
        growl.error("Failed to upload the header picture");
        return $scope.$broadcast('header:uploading:stop');
      }
      
      $scope.user.headerPicture = name;
      $scope.updateUser(function () {
        $scope.$broadcast('header:uploading:stop');
      });
    });
  };
}]);
