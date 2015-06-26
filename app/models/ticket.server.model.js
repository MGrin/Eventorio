'use strict';

var app;
var mongoose = require('mongoose');
var troop = require('mongoose-troop');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var _ = require('underscore');
var async = require('async');
var randomstring = require('randomstring');



exports.initModel = function (myApp) {
  app = myApp;
};

var TicketSchema = exports.Schema = new Schema({
  event: {
    type: ObjectId,
    ref: 'Event'
  },
  user: {
    type: ObjectId,
    ref: 'User'
  },
  number: String
});

TicketSchema
  .virtual('id')
  .get(function () {
    return this._id.toString();
  });

TicketSchema.statics = {
  create: function (event, user, ticketType, charge, cb) {
    return cb(new Error('Processing transaction is not implemented yet'));
  }
}