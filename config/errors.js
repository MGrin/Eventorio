/**
 * Processes errors in the routes
 */

'use strict';

module.exports = function (app) {
  // assume 'not found' in the error msgs
  // is a 404. this is somewhat silly, but
  // valid, you can do whatever you like, set
  // properties, use instanceof etc.
  app.use(function (err, req, res, next) {
    // treat as 404
    if (err.message.indexOf('not found') !== -1) return next();

    // log it
    app.logger.error(err.stack);

    // error page
    res.status(500).render('error.server.jade', {status: 500, url: req.originalUrl, error: err});
  });

  // assume 404 since no middleware responded
  app.use(function (req, res) {
    res.status(404).render('error.server.jade', {status: 404, url: req.originalUrl, error: 'Not found'});
  });
};
