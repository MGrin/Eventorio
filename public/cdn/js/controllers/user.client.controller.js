app.controller('UserController', ['$scope', 'Global', 'Users', function ($scope, Global, Users) {
  $scope.global = Global;

  Users.getCurrentUser(function () {
    $scope.editable = (Global.me.id === $scope.loggedUserId)
  });

  $scope.setupEditable = function () {
    $('.user-name .editable').editable({
      type: 'text',
      url: window.location.pathname,
      ajaxOptions: {
        type: 'PUT',
        dataType: 'json'
      },
      pk: '',
      mode: 'popup',
      name: 'name',
      title: 'Enter your name',
      showbuttons: false
    });

    $('.user-description .editable').editable({
      type: 'textarea',
      url: window.location.pathname,
      ajaxOptions: {
        type: 'PUT',
        dataType: 'json'
      },
      pk: '',
      mode: 'popup',
      name: 'desc',
      title: 'Describe yourself',
      showbuttons: false
    });
  };

  setTimeout($scope.setupEditable, 1000);
}]);