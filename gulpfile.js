var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var jsmin = require('gulp-jsmin');
var stylus = require('gulp-stylus');
var watch = require('gulp-watch');
var jade = require('gulp-jade');

var fs = require('fs-extra');
var findit = require('findit');
var path = require('path');
var async = require('async');

var scriptsFile = './app/views/layouts/scripts.server.jade';

var ENV = process.env.NODE_ENV || 'development';

gulp.task('compile', function () {
  fs.mkdirpSync('./public/css/');
  fs.mkdirpSync('./public/view/');

  gulp.src('./public/stylus/*.styl')
    .pipe(stylus())
    .pipe(gulp.dest('./public/css/'));

  gulp.src('./public/jade/*.jade')
    .pipe(jade({}))
    .pipe(gulp.dest('./public/view/'));
});

gulp.task('compress', function() {
  fs.mkdirpSync('./public/cdn/');

  if (ENV === 'production') {
    gulp.src(['./public/js/*.js', './public/js/*/*.js'])
      .pipe(jsmin())
      .pipe(gulp.dest('./public/cdn/js/'));
  } else {
    gulp.src(['./public/js/*.js', './public/js/*/*.js'])
    .pipe(gulp.dest('./public/cdn/js/'));
  }

});

gulp.task('clean', function () {
  fs.removeSync('./public/cdn/');
  fs.removeSync('./public/css/');
  fs.removeSync('./public/view/');
});

gulp.task('default', ['clean', 'compile', 'compress'], function() {
  nodemon({
    ignore: ['public/pictures/'],
    script: 'app.js'
  }).on('change', ['clean', 'compile', 'compress']);
});
