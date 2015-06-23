'use strict';

app.directive('headerPicture', ['Global', function (Global) { // jshint ignore:line
  return {
    scope: {
      item: '='
    },
    link: function ($scope, element) {
      $scope.$watch('item.headerPicture', function (newVal) {
        var imageURL;
        if (!newVal) {
          imageURL = '/img/default_header.png';
        } else {
          imageURL = Global.userContentServer + '/' + $scope.item.id + '/header' + newVal;
        }

        element.css({
          'background-image': 'url(' + imageURL + ')',
          'background-size': 'cover'
        });
      });
    }
  };
}]);
