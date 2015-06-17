'use strict';

app.directive('eventAvatar', [function () { // jshint ignore:line
  return {
    scope: {
      item: '='
    },
    link: function ($scope, element, attrs) {
      var ajustPadding = attrs.ajustPadding;
      var removePadding = attrs.removePadding;

      var setupHeight = function () {
        var padding = 0;
        if (ajustPadding) {
          padding = parseInt($(element).css('padding-left')) + parseInt($(element).css('padding-right'));
        }
        if (removePadding) {
          padding = - parseInt($(element).css('padding-left')) - parseInt($(element).css('padding-right'));
        }
        $(element).css('height', $(element).width() + padding);
      };

      $scope.$watch('item.picture', function (newVal) {
        var imageURL;
        if (!newVal) {
          imageURL = '/img/default_event_logo.png';
        } else {
          imageURL = '/pictures/' + $scope.item.id + '/avatar_' + newVal;
        }
        element.css({
          'background-image': 'url(' + imageURL + ')',
          'background-size': 'cover'
        });
        setupHeight();
      });
    }
  };
}]);
