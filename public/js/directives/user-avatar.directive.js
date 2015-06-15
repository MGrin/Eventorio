'use strict';

app.directive('userAvatar', [function () { // jshint ignore:line
  return {
    scope: {
      item: '='
    },
    link: function ($scope, element, attrs) {
      var ajustPadding = attrs.ajustPadding;

      var setupHeight = function () {
        var padding = 0;
        if (ajustPadding) {
          padding = parseInt($(element).css('padding-left')) + parseInt($(element).css('padding-right'));
        }
        $(element).css('height', $(element).width() + padding);
      };

      $scope.$watch('item.pictureProvider', function (newVal) {
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

        var oldWidth = 0;
        var widthChanges = 0;
        var ajustHeight = function () {
          if ($(element).width() !== oldWidth) {
            setupHeight();
            oldWidth = $(element).width();
          }
          widthChanges++;

          if (widthChanges < 5) setTimeout(ajustHeight, 500);
        };
        ajustHeight();
      });
    }
  };
}]);
