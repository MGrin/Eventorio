app.factory('Notifications', function () {
  return {
    error: function (DOM, error, timeout, layout) {
      DOM.noty({
        text: error,
        type: 'error',
        timeout: timeout || 2000,
        layout: layout || 'Bottom'
      });
    },

    info: function (DOM, info, timeout, layout) {
      DOM.noty({
        text: info,
        type: 'info',
        timeout: timeout || 2000,
        layout: layout || 'Bottom'
      });
    }
  }
});