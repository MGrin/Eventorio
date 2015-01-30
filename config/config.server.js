'use strict';

var ENV = process.env.NODE_ENV || 'development';
var path = require('path');
var rootPath = path.normalize(__dirname + '/..');

var config = {
  development: {
    db: 'mongodb://localhost/Eventorio-dev',
    root: rootPath,
    port: 7000,
    serverUrl: 'http://eventorio.me/',
    name: 'Eventorio',
    gravatar: {
      s: '400',
      d: 'retro'
    },
    mandrill: {
      API_KEY: 'wtWcKsV31HCK-z05mhKgMQ'
    },
    google: {
      maps: {
        clientId: '777903649350-2qekprt60e60u24sk2q43pl98bkb4duj.apps.googleusercontent.com',
        clientSecret: '777903649350-2qekprt60e60u24sk2q43pl98bkb4duj@developer.gserviceaccount.com'
      }
    },
    constants: {
      users: {
        maxFollowerAutoFollow: 50
      }
    }
  },

  production: {
    db: 'mongodb://eventorio:Eventorio2014Mongolab@ds063779.mongolab.com:63779/eventorio',
    root: rootPath,
    port: process.env.PORT || 80,
    serverUrl: 'http://eventorio.me/',
    name: 'Eventorio',
    gravatar: {
      s: '400',
      d: 'retro'
    },
    mandrill: {
      API_KEY: 'wtWcKsV31HCK-z05mhKgMQ'
    },
    google: {
      maps: {
        clientId: '777903649350-2qekprt60e60u24sk2q43pl98bkb4duj.apps.googleusercontent.com',
        clientSecret: '777903649350-2qekprt60e60u24sk2q43pl98bkb4duj@developer.gserviceaccount.com'
      }
    },
    constants: {
      users: {
        maxFollowerAutoFollow: 50
      }
    }
  }
};

config = config[ENV];
config.ENV = ENV;

module.exports = config;
