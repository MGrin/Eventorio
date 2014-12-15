app.directive('eventName', ['Global', function (Global) {
  return {
    scope: {
      name: '@',
      mode: '@'
    },
    link: function (scope, element, attrs) {
      var name = scope.name;

      var validateEventName = function (name) {
        if (!name || name.length === 0 || name === '') return 'Name should not be empty!';
        if (name.length > 20) return 'Name should not be larger than 20 characters';
        return null;
      };

      var setEditable = function () {
        $(element).editable({
          type: 'text',
          mode: 'inline',
          placeholder: 'Event title',
          title: 'Enter event title',
          onblur: 'cancel',
          send: 'always',
          selector: '.editable',
          highlight: false,
          validate: validateEventName
        });
      };

      var setup = function (mode) {
        switch (mode) {
          case 'Normal': {
            $(element).html('<span>' + name + '</name>');
            break;
          };
          case 'Edit': {
            $(element).html('<a href="#" class=".editable">' + name + '</a>');
            setEditable();
          };
          case 'Create': {
            $(element).html('<a href="#" class=".editable">Event name</a>');
            setEditable();
          };
        }
      };

      scope.$watch('mode', function (value) {
        if (value) setup(value);
      });

      setup(scope.mode);
    },
  }
}]);