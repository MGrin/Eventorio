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
    name: 'Eventorio',
    facebook: {
      clientID: 'APP_ID',
      clientSecret: 'APP_SECRET',
      callbackURL: 'http://localhost:8000/auth/facebook/callback'
    }
  },

  production: {
    db: 'mongodb://localhost/Eventorio',
    root: rootPath,
    port: 7000,
    serverUrl: 'http://localhost:7000',
    name: 'Eventorio',
    facebook: {
      clientID: 'APP_ID',
      clientSecret: 'APP_SECRET',
      callbackURL: 'http://localhost:7000/auth/facebook/callback'
    }
  }
};

config = config[ENV];
config.ENV = ENV;

module.exports = config;
