'use strict';

var gulp = require('gulp');
var jsmin = require('gulp-jsmin');
var stylus = require('gulp-stylus');
var jade = require('gulp-jade');
var nodemon = require('gulp-nodemon');

var fs = require('fs-extra');

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

gulp.task('default', ['clean', 'compile', 'compress'], function () {
  if (process.env.NODE_ENV === 'production') return;

  nodemon({
    script: 'app.js',
    ignore: ['./public/cdn', './public/css'],
    tasks: ['clean', 'compile', 'compress']
  });
});
