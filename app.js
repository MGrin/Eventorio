'use strict';
var express = require('express');
var fs = require('fs');
var async = require('async');
var mongoose = require('mongoose');
var passport = require('passport');
var boot = require('./lib/boot');
var inflection = require('inflection');

var color = {
  blue: '\x1B[0;34m',
  _blue: '\x1B[4;34m', // blue underlined
  green: '\x1B[0;32m',
  red: '\x1B[0;31m',
  default: '\x1B[0;39m'
};

var app = express();
app.config = require('./config/config.server');

require('./config/logger.server')(app);
require('./lib/email')(app);
require('./public/js/shared/validator.shared.js')(app);

exports = module.exports = app;

app.lib = require('./lib/lib.js');

async.series([
  function (cb) {
    // Bootstrap MongoDB connection
    mongoose.connection.on('error', function (err) {
      cb(new Error('MongoDB connection error: \n' + err.message));
    });
    mongoose.connection.on('open', function () {
      app.logger.info('MongoDB connection established');
      cb();
    });
    mongoose.connect(app.config.db);
  },
  function (cb) {
    // Bootstrap models
    boot.initModels(app);
    app.logger.info('Models loaded');
    cb();
  },
  function (cb) {
    // Bootstrap passport config
    // attaches login strategies to the passport variable
    require('./config/passport')(app, passport);

    // express settings
    require('./config/express')(app, passport);

    // load controllers into app.controllers
    app.controllers = {};
    var controllersPath = __dirname + '/app/controllers';
    fs.readdirSync(controllersPath).forEach(function (file) {
      var controller = require(controllersPath + '/' + file);
      controller.init(app);

      var fileName = file.replace(/.server.controller.js$/, '');
      var controllerName = inflection.camelize(fileName);
      app.controllers[controllerName] = controller;
    });

    require('./app/routes.server.js')(app, passport);

    // initialize error routes 404 and 500
    // if problems happen with routes in controller, these routes will be called
    require('./config/errors')(app);

    app.logger.info('Controllers loaded');

    // Bootstrap Express and SocketIO
    var server = require('http').createServer(app);

    // Start the app with attached sockets by listening on port
    server.listen(app.config.port);
    app.logger.info('Express app started on port ' + app.config.port);
    cb();
  }
], function (err) {
  if (err) {
    app.err(err);
    app.err(color.red + 'Could not start the server. See problems above.' + color.default);

    // stop execution of the program
    process.exit();
  }

  // if everything is fine, tell the developer
  app.logger.info(
    color.green +
    'The server [' + app.config.name + '] is up and running!' +
    color.default
  );
});
