var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var insert = require('gulp-insert');
var banner = '/*! angular-kpax.min.js build:' + require('./package.json').version + '. Copyright(c) 2014 Dg Nechtan http://hax0r.in MIT Licensed */ ';

var files = {
  kpax: 'angular-kpax.min.js',
  all: 'socket.io-client-angular-kpax.js'
}
gulp.task('uglify', function() {
  return gulp.src('./angular-kpax.js')
    .pipe(uglify())
    .pipe(concat(files.kpax))
    .pipe(insert.prepend(banner))
    .pipe(gulp.dest('./'));
});

gulp.task('combine', ['uglify'], function() {
  return gulp.src([
    './bower_components/socket.io-client/dist/socket.io.min.js',
    './angular-kpax.min.js'
  ])
    .pipe(concat(files.all))
    .pipe(gulp.dest('./'));
});

gulp.task('default', ['combine'], function() {
  for (var x in files) {
    console.log('✔ ', files[x]);
  }
});
