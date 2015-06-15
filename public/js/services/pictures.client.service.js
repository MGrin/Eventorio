'use strict';

app.factory('Pictures', function () { // jshint ignore:line
  var sendXHR = function (url, data, success, fail) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200) {
        return success(this.responseText);
      } else if (this.readyState === 4 && this.status !== 200) {
        return fail(this.responseText);
      }
    };
    xhr.send(data);
  };
  return {
    upload: function (blob, itemId, type, cb) {
      var url = '/pictures/' + itemId + '?type=' + type;
      sendXHR(url, blob, function (img) {
        return cb(null, img);
      }, function (err) {
        return cb(err);
      });
    }
  };
});
