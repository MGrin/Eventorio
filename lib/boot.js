/**
 * Boot module contains common functions used to start
 * the app during normal, migration and test start
 */

'use strict';

var fs = require('fs');
var inflection = require('inflection');
var mongoose = require('mongoose');

module.exports = {
  /**
   * Load models into app object from app/models/*.model.server.js files
   */
  initModels: function (app) {
    var modelsDir = app.config.root + '/app/models/';
    fs.readdirSync(modelsDir).forEach(function (file) {
      var model = require(modelsDir + file);

      // Get model name as string
      var fileName = file.replace(/.server.model.js$/, '');
      var modelName = inflection.camelize(fileName);

      // Init mongoose model based on schema from model file
      // and attach model to the app variable
      app[modelName] = mongoose.model(modelName, model.Schema);
      model.initModel(app);
    });
  }

};
