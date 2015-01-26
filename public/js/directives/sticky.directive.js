app.directive('sticky', ['Global', function (Global) {
  return {
    link: function ($scope, element, attrs) {
      var elementMargin = parseInt(attrs['initMargin']) || 0;
      var elementTopMargin = parseInt(attrs['topOffset']) || 10;
      var initTop;
      $(window).load(function () {
        initTop = $(element).offset().top - (elementMargin + elementTopMargin);
      });

      var stick = function () {
        var windowTop = $(window).scrollTop();
        if (windowTop > initTop) {
          $(element).css('top', elementMargin + elementTopMargin);
        } else {
          $(element).css('top', initTop - windowTop + elementMargin);
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