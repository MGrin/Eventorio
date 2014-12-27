'use strict';

var ENV = process.env.NODE_ENV || 'development';
var path = require('path');
var rootPath = path.normalize(__dirname + '/..');

var config = {
  development: {
    db: 'mongodb://localhost/Eventorio-dev',
    root: rootPath,
    port: 7000,
    serverUrl: 'http://eventorio.uk.to/',
    name: 'Eventorio',
    gravatar: {
      s: '400',
      d: 'http://www.wpsymposiumpro.com/wp-content/uploads/2014/04/iStock_000033523696Small.jpg'
    },
    mandrill: {
      API_KEY: 'wdyAQM7hpNcKB0XU_QjvEQ'
    }
  },

  production: {
    db: 'mongodb://eventorio:Eventorio2014Mongolab@ds063779.mongolab.com:63779/eventorio',
    root: rootPath,
    port: process.env.PORT || 80,
    serverUrl: 'http://eventorio.uk.to/',
    name: 'Eventorio',
    gravatar: {
      s: '400',
      d: 'http://www.wpsymposiumpro.com/wp-content/uploads/2014/04/iStock_000033523696Small.jpg'
    },
    mandrill: {
      API_KEY: 'wdyAQM7hpNcKB0XU_QjvEQ'
    }
  }
};

config = config[ENV];
config.ENV = ENV;

module.exports = config;
