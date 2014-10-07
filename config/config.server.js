'use strict';

var ENV = process.env.NODE_ENV || 'development';
var path = require('path');
var rootPath = path.normalize(__dirname + '/..');

var config = {
  development: {
    db: 'mongodb://localhost/Eventorio-dev',
    root: rootPath,
    port: 7000,
    serverUrl: 'http://localhost:7000',
    name: 'Eventorio'
  },

  production: {
    db: 'mongodb://eventorio:Eventorio2014Mongolab@ds063779.mongolab.com:63779/eventorio',
    root: rootPath,
    port: process.env.PORT || 7000,
    serverUrl: 'http://eventorio.herokuapp.com',
    name: 'Eventorio'
  }
};

config = config[ENV];
config.ENV = ENV;

module.exports = config;
