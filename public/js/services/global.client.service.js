app.factory('Global', function ($document, $filter, $location) {
  'use strict';

  var Global = {
    app: app,
    config: {
      appName: 'Eventorio'
    }
  };

  app.Global = Global;
  return Global;
});
