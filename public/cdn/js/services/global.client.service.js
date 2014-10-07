app.factory('Global', function ($document, $filter, $location) {
  'use strict';

  var Global = {
    app: app,
    config: {
      appName: 'Eventorio'
    },
    monthNames: [ "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December" ]
  };

  app.Global = Global;
  return Global;
});
