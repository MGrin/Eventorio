app.directive('searchItem', [function () {
  return {
    template: '<a>' +
                '<img width="80" class="img img-responsive img-thumbnail pull-left"/>' +
                '<span class="title"></span>' +
                '<p class="name"></p>' +
              '</a>',
    link: function ($scope, element, attr) {
      $(element).find('a').attr('href', attr.href);
      $(element).find('img').attr('src', attr.picture);
      $(element).find('.title').text(attr.title);
      $(element).find('.name').text(attr.name);
    }
  }
}]);