app.directive('searchItem', [function () {
  return {
    scope: {
      item: '='
    },
    template: '<a>' +
                '<div style="width: 80px" id="#itemThumbnail"></div>' +
                '<span class="title"></span>' +
                '<p class="name"></p>' +
              '</a>',
    link: function ($scope, element, attr) {
      var itemType = attr.itemType;
      var href;
      var title;
      var name;
      switch (itemType) {
        case 'user': {
          href = "/users/" + $scope.item.username;
          title = $scope.item.username;
          name = $scope.item.name || 'No name';
          break;
        }
        case 'event': {
          href = "/events" + $scope.item.id;
          title = $scope.item.name;
          name = $scope.item.organizator.username
          break;
        }
      }
      $(element).find('#itemThumbnail').each(function () {
        $(this).html($compile('<div picture item-type="' + itemType + '" type="avatar" item="' + item + '" class="img img-circle"></div>')($scope));
      });
      $(element).find('a').attr('href', href);
      $(element).find('.title').text(title);
      $(element).find('.name').text(name);
    }
  }
}]);