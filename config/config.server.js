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
      clientID: '1553150044916218',
      clientSecret: '82f2d464661fdb77be507cfc729cb046',
      callbackURL: 'http://localhost:7000/auth/facebook/callback'
    }
  },

  production: {
    db: 'mongodb://localhost/Eventorio',
    root: rootPath,
    port: 7000,
    serverUrl: 'http://localhost:7000',
    name: 'Eventorio',
    facebook: {
      clientID: '1553150044916218',
      clientSecret: '82f2d464661fdb77be507cfc729cb046',
      callbackURL: 'http://localhost:7000/auth/facebook/callback'
    }
  }
};

config = config[ENV];
config.ENV = ENV;

module.exports = config;
