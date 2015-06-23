'use strict';

app.factory('Pictures', ['Global', function (Global) { // jshint ignore:line
  var userContentServer = Global.userContentServer;

  var sendXHR = function (url, blob, method, success, fail) {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open(method, url, true);
    
    xhr.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200) {
        return success(this.responseText);
      } else if (this.readyState === 4 && this.status !== 200) {
        return fail(this.responseText);
      }
    };
    var formData = new FormData();
    if (blob) {
      formData.append('picture', blob);
    }
    xhr.send(formData);
  };
  return {
    upload: function (blob, itemId, type, cb) {
      var url = userContentServer + '/' + itemId + '/' + type;
      sendXHR(url, blob, 'POST', function (img) {
        return cb(null, img);
      }, function (err) {
        return cb(err);
      });
    },
    confirm: function (itemId, type, name, cb) {
      var url = userContentServer + '/' + itemId + '/' + type + '/' + name;
      sendXHR(url, null, 'PUT', function () {
        return cb();
      }, function (err) {
        return cb(err);
      });
    },
    remove: function (itemId, type, name, cb) {
      var url = userContentServer + '/' + itemId + '/' + type + '/' + name;
      sendXHR(url, null, 'DELETE', function () {
        return cb();
      }, function (err) {
        return cb();
      });
    }
  };
}]);
