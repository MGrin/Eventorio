app.directive('picture', [function () {
  return {
    scope: {
      item: "="
    },
    link: function ($scope, element, attrs) {
      var type = attrs.type;
      var itemType = attrs.itemType;

      var setupHeight = function () {
        if ($(element).width() === 0) {
          return setTimeout(setupHeight, 500);
        }
        $(element).css('height', $(element).width());
      };
      switch (type) {
        case 'header': {
          $scope.$watch('item.headerPicture', function (newVal, oldVal) {
            var imageURL;
            if (!newVal) {
              imageURL = '/img/user_background.png';
            } else if (itemType === 'event') {
              imageURL = '/pictures/' + itemType + 's/' + ($scope.item.id || $scope.item.tempId) + '/header_' + newVal;
            } else if (itemType === 'user') {
              imageURL = '/pictures/' + itemType + 's/' + $scope.item.id + '/header_' + newVal;
            }

            element.css({
              'background-image': 'url(' + imageURL + ')',
              'background-size': 'cover'
            });
          });

          break;
        }

        case 'avatar': {
          if (itemType === 'event') {
            $scope.$watch('item.picture', function (newVal, oldVal) {
              var imageURL;
              if (!newVal) {
                imageURL = '/img/event_logo.jpg';
              } else {
                imageURL = '/pictures/' + itemType + 's/' + $scope.item.id + '/avatar_' + newVal;
              }
              element.css({
                'background-image': 'url(' + imageURL + ')',
                'background-size': 'cover'
              });
              setupHeight();
            });
          } else if (itemType === 'user') {
            $scope.$watch('item.pictureProvider', function (newVal, oldVal) {
              var imageURL;
              switch (newVal) {
                case 'gravatar' : {
                  imageURL = $scope.item.gravatarPicture;
                  break;
                }
                case 'facebook' : {
                  imageURL = '//graph.facebook.com/v2.2/' + $scope.item.facebook.id + '/picture?width=450&height=450';
                  break;
                }
                case 'google' : {
                  imageURL = $scope.item.google._json.image.url;
                  break;
                }
              }
              if (imageURL) {
                element.css({
                  'background-image': 'url(' + imageURL + ')',
                  'background-size': 'cover'
                });
              }

              setupHeight();
            });
          }
          break;
        }
      }
    }
  }
}]);