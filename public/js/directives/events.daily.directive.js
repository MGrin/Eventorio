app.directive('dailyEvents', ['$rootScope', 'Global', function ($rootScope, Global) {
  return {
    templateUrl: '/view/events.daily.html',
    link: function ($scope, element, attrs) {
      if (Global.screenSize === 'lg') {
        // $(element).css('width', ($('#calendar-well').width() + 2 * parseInt($('#calendar-well').css('padding-left'))) + 'px');
      }
    }
  }
}]);