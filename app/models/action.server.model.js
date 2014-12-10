'use strict';

/**
 * Module dependencies.
 */
var app; // all application-wide things like ENV, config, logger, etc
var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;
var _ = require('underscore');
var async = require('async');
var ObjectId = Schema.ObjectId;
var troop = require('mongoose-troop');

/**
 * Models
 */
exports.initModel = function (myApp) {
  app = myApp;
};

var ActionSchema = exports.Schema = new Schema({
  // Let's close issue
});

ActionSchema.statics = {

}
ActionSchema.plugin(troop.timestamp, {
  useVirtual: false
});