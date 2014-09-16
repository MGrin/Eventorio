/**
 * Logger Configuration
 *
 * sets app.logger
 */

'use strict';

var winston = require('winston');
var moment = require('moment');

module.exports = function (app) {
  var timestamp = function () {
    // 20 Dec 00:58:38
    return moment().format('D MMM HH:mm:ss');
  };

  // There can be several different loggers in the application
  // app.logger is the main logger app is using
  // socket.io uses another logger, which can be accessed via
  // app.loggers.get('socket.io')
  app.loggers = winston.loggers;

  // -----------------------
  // DEVELOPMENT ENVIRONMENT
  // -----------------------
  if (app.ENV === 'development') {
    // Log level in development environment
    var devLevel = 'info';

    // Main application logger
    winston.loggers.add('app', {
      console: {
        colorize: 'true',
        label: 'App',
        timestamp: timestamp,
        level: devLevel
      },
      file: {
        colorize: 'true',
        json: false,
        filename: 'log/dev.log',
        label: 'App',
        timestamp: timestamp,
        level: devLevel
      }
    });

    // Express logger
    winston.loggers.add('express', {
      console: {
        colorize: 'true',
        label: 'Express',
        timestamp: timestamp,
        level: devLevel
      },
      file: {
        colorize: 'true',
        json: false,
        filename: 'log/dev.log',
        label: 'Express',
        timestamp: timestamp,
        level: devLevel
      }
    });

    // Socket.IO logger
    winston.loggers.add('socket.io', {
      console: {
        level: devLevel,
        colorize: 'true',
        label: 'SocketIO',
        timestamp: timestamp
      },
      file: {
        colorize: 'true',
        json: false,
        filename: 'log/dev.log',
        level: devLevel,
        label: 'SocketIO',
        timestamp: timestamp
      }
    });
  }

  // ----------------------
  // PRODUCTION ENVIRONMENT
  // ----------------------
  if (app.ENV === 'production') {
    // TODO: Once our production server is stable, switch to 'error'
    // Log level in production environment
    var prodLevel = 'info';

    winston.loggers.add('app', {
      console: {
        colorize: 'true',
        label: 'App',
        timestamp: timestamp,
        level: prodLevel
      },
      file: {
        colorize: 'true',
        filename: 'log/prod.log',
        json: false,
        label: 'App',
        timestamp: timestamp,
        level: prodLevel
      }
    });

    // Express logger
    winston.loggers.add('express', {
      console: {
        colorize: 'true',
        label: 'Express',
        timestamp: timestamp,
        level: prodLevel
      },
      file: {
        colorize: 'true',
        json: false,
        filename: 'log/prod.log',
        label: 'Express',
        timestamp: timestamp,
        level: prodLevel
      }
    });

    // Socket.IO logger
    winston.loggers.add('socket.io', {
      console: {
        level: prodLevel,
        colorize: 'true',
        label: 'SocketIO',
        timestamp: timestamp
      },
      file: {
        colorize: 'true',
        json: false,
        filename: 'log/prod.log',
        level: prodLevel,
        label: 'SocketIO',
        timestamp: timestamp
      }
    });
  }

  // Set the default app logger
  app.logger = app.loggers.get('app');

  // Set logging stream for express.logger
  var expressLogger = app.loggers.get('express');
  app.expressLogStream = {
    write: function (message) {
      // remove \n at the end of line
      var output = message.slice(0, -1);
      expressLogger.info(output);
    }
  };
};
