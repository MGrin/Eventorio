app.directive('sticky', ['Global', function (Global) {
  return {
    scope: {
      stickIf : "=",
      params: "="
    },
    link: function ($scope, element, attrs) {
      var elementTopMargin = $scope.params.topOffset || 10;
      var windowTopLimit = $scope.params.topLimit || 0;

      var stick = function () {
        var initTop;
        var updateInitTop = function () {
          var headerMargin = parseInt($('#header').css('margin-top'));
          initTop = $('.img-event-header').height() + $('#header').height() + headerMargin - 120;
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
        $scope.$watch('stickIf', function (newValue, oldValue) {
          if (newValue) {
            $(element).addClass('affix affix-top');
            $('#rightSidebar').addClass('col-lg-offset-5');
            $('#rightSidebar').removeClass('col-lg-offset-1');
            $(element).css('max-height', $(window).height() - 2 * elementTopMargin - $('#header').height());
            $(element).css('margin-top', 0);
            $('.event-name').css('margin-top', '-100px');
            $(window).scroll(stick);
            stick();
          } else {
            $(element).removeClass('affix affix-top');
            $(element).css('margin-top', 0);
            $('.event-name').css('margin-top', 0);
            $('#rightSidebar').removeClass('col-lg-offset-5');
            $('#rightSidebar').addClass('col-lg-offset-1');
          }
        });
      }
    },
  }
}]);