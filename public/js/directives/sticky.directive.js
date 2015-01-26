app.directive('sticky', ['Global', function (Global) {
  return {
    scope: {
      initTopFn: "&"
    },
    link: function ($scope, element, attrs) {
      var elementTopMargin = parseInt(attrs['topOffset']) || 10;

      var stick = function () {
        var initTop = $scope.initTopFn();
        if (initTop < 0) return stick();
        var windowTop = $(window).scrollTop();
        if (windowTop > initTop) {
          $(element).css('top', elementTopMargin);
        } else {
          $(element).css('top', initTop - windowTop);
        }
      };

      if (Global.screenSize === 'lg') {
        $(element).addClass('affix affix-top');
        $(window).scroll(stick);
        stick();
      }

    },
  }
}]);