'use strict';

app.directive('tagsInput', [function () { // jshint ignore:line
  return {
    scope: {
      event: '='
    },
    template: '<form class="form-inline col-lg-12 col-md-12 col-sm-12 col-xs-12">' +
                '<div class="form-group col-lg-12 col-md-12 col-sm-12 col-xs-12">' +
                  '<input class="form-control col-lg-10" type="text" placeholder="Add new tag" ng-model="newTag">' +
                  '<button class="btn btn-xs btn-flat btn-success" ng-disabled="newTag === \'\'"><span class="mdi-action-done"></span></button>' +
                '</div>' +
              '</form>',
    link: function ($scope, element) {
      $scope.newTag = '';

      $scope.addTag = function (tag) {
        if (!tag || tag === '') return;

        var exists = _.find($scope.event.tags, function (t) {
          return t.text === tag;
        });

        if (exists) return;

        $scope.event.tags.push({
          text: tag,
          weight: 1
        });
        $scope.$apply();
      };

      element.find('button').each(function () {
        $(this).click(function () {
          $scope.addTag($scope.newTag);
          $scope.newTag = '';
        });
      });
    }
  };
}]);
