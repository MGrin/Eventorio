'use strict';

var ENV = process.env.NODE_ENV || 'development';
var path = require('path');
var rootPath = path.normalize(__dirname + '/..');

var MANDRILL_KEY = process.env.MANDRILL_KEY;
var googleClientId = process.env.GOOGLE_CLIENT_ID;
var googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
var facebookClientId = process.env.FACEBOOK_CLIENT_ID;
var facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET;

var config = {
  development: {
    db: 'mongodb://localhost/Eventorio-dev',
    root: rootPath,
    port: 7000,
    serverUrl: 'http://localhost:7000/',
    name: 'Eventorio',
    pictures: {
      user: {
        pwd: rootPath + '/public/pictures/users/'
      },
      event: {
        pwd: rootPath + '/public/pictures/events/'
      }
    },
    gravatar: {
      s: '400',
      d: 'retro'
    },
    mandrill: {
      API_KEY: MANDRILL_KEY
    },
    google: {
      clientID: googleClientId,
      clientSecret: googleClientSecret
    },
    facebook: {
      clientID: facebookClientId,
      clientSecret: facebookClientSecret
    },
    constants: {
      users: {
        maxFollowerAutoFollow: 50
      },
      pictures: {
        timeout: 100
      }
    },
    EventorioUser: {
      email: 'support@eventorio.me',
      password: '1gjhfe7vyieASFJV7VHGKbfsda'
    }
  },

  production: {
    db: 'mongodb://localhost:34563/eventorio',
    root: rootPath,
    port: process.env.PORT || 80,
    serverUrl: 'http://eventorio.me/',
    name: 'Eventorio',
    pictures: {
      user: {
        pwd: rootPath + '/public/pictures/users/'
      },
      event: {
        pwd: rootPath + '/public/pictures/events/'
      }
    },
    gravatar: {
      s: '400',
      d: 'retro'
    },
    mandrill: {
      API_KEY: MANDRILL_KEY
    },
    google: {
      clientID: googleClientId,
      clientSecret: googleClientSecret
    },
    facebook: {
      clientID: facebookClientId,
      clientSecret: facebookClientSecret
    },
    constants: {
      users: {
        maxFollowerAutoFollow: 50
      },
      pictures: {
        timeout: 3 * 60 * 60 * 1000 // 3 hours
      }
    },
    EventorioUser: {
      email: 'support@eventorio.me',
      password: '1gjhfe7vyieASFJV7VHGKbfsda'
    }
  }
};

config = config[ENV];
config.ENV = ENV;

module.exports = config;
