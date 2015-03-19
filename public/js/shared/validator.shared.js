var initValidator = function (app) {
  app.validator = {};

  app.validator.validateEventName = function (name) {
    if (!name || name === '') return 'Name should not be empty';
    if (name.length < 4 || name.length > 20) return 'Name should not be shorter 4 symbols and not longer 20 symbols';

    return null;
  };

  app.validator.validateEventDate = function (date) {
    if (!date) return 'Please, choose the date';

    return null;
  };

  app.validator.validateEventVenue = function (venue) {
    if (!venue) return 'Please, choose the venue';

    return null;
  };
};

if (typeof app === 'undefined') {
  // Server side load
  module.exports = initValidator;
} else {
  initValidator(app);
}