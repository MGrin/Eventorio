app.directive('searchItem', [function () {
  return {
    template: '<a>' +
                '<img width="80" class="img img-responsive img-thumbnail pull-left"/>' +
                '<span></span>' +
              '</a>',
    link: function ($scope, element, attr) {
      $(element).find('a').attr('href', attr.href);
      $(element).find('img').attr('src', attr.picture);
      $(element).find('span').text(attr.title);
    }
  }
}]);