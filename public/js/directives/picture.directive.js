app.directive('picture', [function () {
  return {
    scope: {
      item: "="
    },
    link: function ($scope, element, attrs) {
      var type = attrs.type;
      var itemType = attrs.itemType;

      switch (type) {
        case 'header': {
          $scope.$watch('item.headerPicture', function (newVal, oldVal) {
            if (!newVal) return;
            var imageURL;

            if (itemType === 'event') {
              var mode = $scope.$parent.mode;
              if (mode === 'Normal') {
                imageURL = '/pictures/' + itemType + 's/' + $scope.item.id + '/header_' + newVal + '.png';
              } else {
                if ($scope.item.id) {
                  imageURL = '/pictures/' + itemType + 's/' + $scope.item.id + '/temp/header_' + newVal + '.png';
                } else {
                  imageURL = '/pictures/' + itemType + 's/' + $scope.item.tempId + '/temp/header_' + newVal + '.png';
                }
              }
            } else if (itemType === 'user') {
              imageURL = '/pictures/' + itemType + 's/' + $scope.item.id + '/header_' + newVal + '.png';
            }

            element.css({
              'background-image': 'url(' + imageURL + ')',
              'background-size': 'cover'
            });
          });

          break;
        }

        case 'avatar': {
          $scope.$watch('item.picture', function (newVal, oldVal) {
            if (!newVal) return;
            var imageURL;

            if (itemType === 'event') {
              var mode = $scope.$parent.mode;
              if ($scope.item.id) {
                imageURL = '/pictures/' + itemType + 's/' + $scope.item.id + '/avatar_' + newVal + '.png';
              } else {
                imageURL = '/pictures/' + itemType + 's/' + $scope.item.tempId + '/temp/avatar_' + newVal + '.png';
              }
            } else if (itemType === 'user') {
              imageURL = newVal;
            }

            element.css({
              'background-image': 'url(' + imageURL + ')',
              'background-size': 'cover'
            });
          });

          var setupHeight = function () {
            if ($(element).width() === 0) {
              return setTimeout(setupHeight, 500);
            }
            $(element).css('height', $(element).width() + 'px');
          };
          setupHeight();
          break;
        }
      }
    }
  }
}]);