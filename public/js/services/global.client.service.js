app.factory('Global', function () {
  'use strict';

  var screenSize;
  if ($(window).width() > 1200) screenSize = 'lg';
  else if ($(window).width() > 992) screenSize = 'md';
  else if ($(window).width() > 768) screenSize = 'sm';
  else screenSize = 'xs';

  var Global = {
    app: app,
    config: {
      appName: 'Eventorio'
    },
    monthNames: [ "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December" ],
    screenSize: screenSize,
    actionTypes: {
      signup: 'signup',
      createEvent: 'create event',
      invite: 'invite',
      attendEvent: 'attend event',
      quitEvent: 'quit event',
      follow: 'follow'
    }
  };

  app.Global = Global;
  return Global;
});
