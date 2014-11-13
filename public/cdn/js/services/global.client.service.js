app.factory('Global', function () {
  'use strict';

  var screenSize;
  if ($(window).width() > 1200) screenSize = 'lg';
  else if ($(window).width() > 992) screenSize = 'md';
  else if ($(window).width() > 768) screenSize = 'sm';
  else screenSize = 'xs';

  if (screenSize !== 'xs') {
    $('#eventCreationDialogTrigger').hide();
    $('#currentDay').mouseenter(function () {
      $('#eventCreationDialogTrigger').show();
    });
    $('#currentDay').mouseleave(function () {
      $('#eventCreationDialogTrigger').hide();
    });
  }
  var Global = {
    app: app,
    config: {
      appName: 'Eventorio'
    },
    monthNames: [ "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December" ],
    screenSize: screenSize
  };

  app.Global = Global;
  return Global;
});
