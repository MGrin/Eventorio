var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var jsmin = require('gulp-jsmin');
var stylus = require('gulp-stylus');
var watch = require('gulp-watch');

var fs = require('fs');
var findit = require('findit');
var path = require('path');

var scriptsFile = './app/views/layouts/scripts.server.jade';

var ENV = process.env.NODE_ENV || 'development';

var includeScripts = function () {
  fs.unlink(scriptsFile);
  var finder = findit('./public/cdn');

  finder.on('file', function (file, stat) {
    var basename = path.basename(file)
    if (basename.match(/.js$/)) {
      var filePath = file.replace('public/', '');
      fs.appendFile(scriptsFile, "script(src=\"/" + filePath + "\")\n");
    }
  });
}

gulp.task('compile', function () {
  var compile = function () {
    gulp.src('./public/stylus/*.styl')
      .pipe(stylus())
      .pipe(gulp.dest('./public/css/'));
  }
  watch('./public/stylus/*.styl', function (files) {
    compile();
  });
  compile();
});

gulp.task('compress', function() {
  var compress = function () {
    if (ENV === 'production') {
      gulp.src(['./public/js/*.js', './public/js/*/*.js'])
        .pipe(jsmin())
        .pipe(gulp.dest('./public/cdn/js/'));
    } else {
      gulp.src(['./public/js/*.js', './public/js/*/*.js'])
      .pipe(gulp.dest('./public/cdn/js/'));
    }
    includeScripts();
  }
  watch(['./public/js/*.js', './public/js/*/*.js'], function (files) {
    compress();
  });
  compress();
});

gulp.task('default', ['compile', 'compress'], function() {
  // place code for your default task here
  watch('*', function (files) {
    nodemon({
      script: 'app.js'
    });
  });
  nodemon({
    script: 'app.js'
  });
});

gulp.task('clean', function () {
  fs.unlink(scriptsFile);
});