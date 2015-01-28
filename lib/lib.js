var _ = require('underscore');

module.exports = {
  /**
   * Generates a new random password
   *
   * @param {Number} length length for password
   * @returns password
   */
  generatePassword: function (length) {
    var password = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    var size = chars.length;
    _.times(length, function () {
      // adds a random symbol to password
      password += chars[Math.floor(Math.random() * size)];
    });

    return password;
  },

  randomInt: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};