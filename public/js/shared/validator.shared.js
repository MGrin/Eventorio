'use strict';

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
    if (!venue || !venue.name) return 'Please, choose the venue';

    return null;
  };

  app.validator.validateEventTickets = function (tickets) {
    if (tickets.length === 0) return null;

    for (var i = 0; i < tickets.length; i++) {
      var ticket = tickets[i];

      if (!ticket.name || ticket.name === '') return 'Ticket\'s name can not be empty!';
      if (!ticket.quantity || ticket.quantity < 1) return 'Ticket\'s quantity can not be less than 1!';
      if (!ticket.price || ticket.price < 1) return 'Ticket\'s price can not be less than 1 CHF.-';

      return null;
    }
  };

  var imageFormats = ['jpg', 'jpeg', 'png'];
  var imageMimes = ['image/png', 'image/jpg', 'image/jpeg'];

  app.validator.validateImageExt = function (file) {
    if (!file.type) {
      var ext = file.name.split('.').pop().toLowerCase();
      if (imageFormats.indexOf(ext) < 0) return 'Only JPEG and PNG formats are supported for header images!';
    } else {
      if (imageMimes.indexOf(file.type) < 0) return 'Only JPEG and PNG formats are supported for header images!';
    }

    return null;
  };

  app.validator.validateEvent = function (event) {
    var errors = [];
    var nameError = app.validator.validateEventName(event.name); // jshint ignore:line
    var dateError = app.validator.validateEventDate(event.date); // jshint ignore:line
    var venueError = app.validator.validateEventVenue(event.venue); // jshint ignore:line
    var ticketsError = app.validator.validateEventTickets(event.tickets); // jshint ignore:line

    if (nameError) errors.push({field: 'name', message: nameError});
    if (dateError) errors.push({field: 'date', message: dateError});
    if (venueError) errors.push({field: 'venue', message: venueError});
    if (ticketsError) errors.push({field: 'tickets', message: ticketsError});

    return errors.length === 0 ? null : errors;
  };
};

if (typeof app === 'undefined') {
  // Server side load
  module.exports = initValidator;
} else {
  initValidator(app); // jshint ignore:line
}
