app.filter('plainText', function () {
  return function (text) {
    var res = String(text).replace(/<[^>]+>/gm, ' ');
    if (res.length > 30) res = res.substring(0, 30) + '...';
    return res;
  }
});