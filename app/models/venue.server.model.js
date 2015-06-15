'use strict';

/**
 * Module dependencies.
 */
var app; // all application-wide things like ENV, config, logger, etc
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var textSearch = require('mongoose-text-search');

/**
 * Models
 */
exports.initModel = function (myApp) {
  app = myApp;
};

/**
 * Events Schema
 */
var VenueSchema = exports.Schema = new Schema({
  name: String,
  desc: String,
  address: String,
  coords: String
});

VenueSchema
  .virtual('id')
  .get(function () {
    return this._id.toString();
  });

VenueSchema.index({ name: 'text', description: 'text'});

VenueSchema.methods = {

};

VenueSchema.statics = {
  load: function (id, cb) {
    app.Venue
      .findById(id)
      .exec(cb);
  },

  create: function (cb) {
    // TODO
    return cb();
  },

};

VenueSchema.plugin(textSearch);
