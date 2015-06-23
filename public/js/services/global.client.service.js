'use strict';

app.factory('Global', function () { // jshint ignore:line

  var screenSize;
  if ($(window).width() > 1200) screenSize = 'lg';
  else if ($(window).width() > 992) screenSize = 'md';
  else if ($(window).width() > 768) screenSize = 'sm';
  else screenSize = 'xs';

  var Global = {
    app: app, // jshint ignore:line
    me: app.user, // jshint ignore:line

    screenSize: screenSize,

    config: {
      img: {
        cover: {
          width: 1200,
          height: 350
        },
        avatar: {
          width: 450,
          height: 450
        }
      }
    },

    // userContentServer: 'http://usercontent.eventorio.me' // production version
    userContentServer: 'http://localhost:7896' // dev version, to be removed!!!
  };

  app.Global = Global; // jshint ignore:line
  return Global;
});
