app.directive('clockpicker', ['$rootScope', 'Global', function ($rootScope, Global) {
  return {
    scope: {
      event: '=event'
    },
    template: "<form class='form form-horizontal'>" +
                "<div class='input-group clockpicker'>" +
                  "<input type='text' class='form-control'>" +
                  "<span class='input-group-addon'>" +
                    "<span class='glyphicon glyphicon-time'></span>" +
                  "</span>" +
                "</div>" +
              "</form>",
    link: function ($scope, element, attrs) {
      element.find('.clockpicker').each(function () {
        $(this).clockpicker({
          default: $scope.event.date || 'now',
          donetext: 'Done',
          autoclose: true
        });
        $(this).find('input[type="text"]').each(function () {
          if ($scope.event.date) $(this).val($scope.event.date.format('HH:mm'));
          else $(this).val(moment().format('HH:mm'));

          $(this).change(function () {
            var timeSplit = $(this).val().split(':');
            var hours = timeSplit[0];
            var minutes = timeSplit[1];

            $rootScope.$broadcast('clockpicker:time', hours, minutes);
          });
        });
      });
    },
  }
}]);