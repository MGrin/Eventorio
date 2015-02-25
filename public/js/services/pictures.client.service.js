app.factory('Pictures', function () {
  var sendXHR = function (url, data, success, fail) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.onreadystatechange = function(e) {
      if (this.readyState === 4 && this.status === 200) {
        return success(this.responseText);
      } else if (this.readyState === 4 && this.status !== 200) {
        return fail(this.responseText);
      }
    };
    xhr.send(data);
  };
  return {
    uploadHeaderForUser: function (blob, user, cb) {
      var url = '/users/' + user.id + '/pictures?type=header';
      sendXHR(url, blob, function (img) {
        return cb(null, img);
      }, function (err) {
        return cb(err);
      });
    },

    uploadHeaderForEvent: function (blob, event, cb) {
      var url;
      if (event.id) {
        url = '/events/' + event.id + '/pictures?type=header';
      } else {
        url = '/pictures/' + event.tempId + '?type=header';
      }

      sendXHR(url, blob, function (img) {
        return cb(null, img);
      }, function (err) {
        return cb(err);
      });
    },

    uploadAvatarForEvent: function (blob, event, cb) {
      var url;

      if (event.id) {
        url = '/events/' + event.id + '/pictures?type=avatar';
      } else {
        url = '/pictures/' + event.tempId + '?type=avatar';
      }

      sendXHR(url, blob, function (img) {
        return cb(null, img);
      }, function (err) {
        return cb(err);
      });
    }
  }
});