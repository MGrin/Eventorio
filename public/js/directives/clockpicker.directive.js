'use strict';

app.directive('clockpicker', ['$rootScope', 'Global', function ($rootScope, Global) { // jshint ignore:line
  return {
    scope: {
      event: '=event'
    },
    templateUrl: '/view/clockpicker.template.html',
    link: function ($scope, element) {
      element.find('.clockpicker').each(function () {
        $(this).clockpicker({
          default: $scope.event.date || 'now',
          donetext: 'Done',
          autoclose: true
        });
        $(this).find('input[type="text"]').each(function () {
          if ($scope.event.date) $(this).val($scope.event.date.format('HH:mm'));
          else $(this).val(moment().format('HH:mm')); // jshint ignore:line

          $(this).change(function () {
            var timeSplit = $(this).val().split(':');
            var hours = timeSplit[0];
            var minutes = timeSplit[1];

            $rootScope.$broadcast('clockpicker:time', hours, minutes);
          });
        });
      });
    },
  };
}]);
