'use strict';

app.directive('datetimepicker', ['$rootScope', 'Global', function ($rootScope, Global) { // jshint ignore:line
  return {
    scope: {
      event: '=event'
    },
    templateUrl: '/view/datetimepicker.template.html',
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

      element.find('.datepicker').each(function () {
        $(this).datepicker({
          autoclose: true,
          format: 'ddth M yyyy'
        });

        var momentFormat = 'Do MMM YYYY';
        if ($scope.event.date) $(this).val($scope.event.date.format(momentFormat));
        else $(this).val(moment().format(momentFormat)); // jshint ignore:line
      }).on('changeDate', function (e) {
        var date, month, year;
        date = e.date.getDate();
        month = e.date.getMonth();
        year = e.date.getYear() + 1900;

        $rootScope.$broadcast('datepicker:date', date, month, year);
      });
    },
  };
}]);
