'use strict';

app.directive('headerPicture', [function () { // jshint ignore:line
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
          imageURL = '/pictures/' + $scope.item.id + '/header_' + newVal;
        }

        element.css({
          'background-image': 'url(' + imageURL + ')',
          'background-size': 'cover'
        });
      });
    }
  };
}]);
