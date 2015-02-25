var _ = require('underscore');
var crypto = require('crypto');
var fs = require('fs');

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
  },

  md5: function (str) {
    str = str.toLowerCase().trim();
    var hash = crypto.createHash("md5");
    hash.update(str);
    return hash.digest("hex");
  },

  fileSHA1: function (filePath, cb) {
    // append hash to the file name for caching
    var shasum = crypto.createHash('sha1');

    fs.readFile(filePath, function (err, data) {
      if (err) return cb(err);
      if (!data) return cb(new Error('Failed to read file ' + filePath));

      shasum.update(data);
      var hash = shasum.digest('hex');
      return cb(null, hash)
    });
  }
};