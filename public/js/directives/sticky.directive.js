app.directive('sticky', ['Global', function (Global) {
  return {
    scope: {
      initTopFn: "&"
    },
    link: function ($scope, element, attrs) {
      var elementTopMargin = parseInt(attrs['topOffset']) || 10;
      var windowTopLimit = parseInt(attrs['topLimit']) || 0;
      $(element).css('max-height', $(window).height() - 2 * elementTopMargin - $('#header').height());
      var stick = function () {
        var initTop;
        var updateInitTop = function () {
          initTop = $scope.initTopFn();
          if (initTop < 0) setTimeout(updateInitTop, 250);
        };
        updateInitTop();
        var windowTop = $(window).scrollTop();

        if (windowTop + windowTopLimit > initTop) {
          $(element).css('top', elementTopMargin + windowTopLimit);
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