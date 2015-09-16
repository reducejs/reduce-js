var gulp = require('gulp');
var reduce = require('..');
var path = require('path');
var gutil = require('gulp-util');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var lazypipe = require('lazypipe');
var del = require('del');

var basedir = path.join(__dirname, 'src');

var postTransforms = lazypipe()
  .pipe(buffer)
  .pipe(uglify)
  .pipe(gulp.dest, 'build');

var factorOpts = {
  outputs: ['a.js', 'b.js'],
  common: 'common.js',
};

var onerror = function (err) {
  gutil.log(err.message);
};

gulp.task('clean', function () {
  return del(path.join(__dirname, 'build'));
});

gulp.task('default', ['clean'], function () {
  return reduce.src('*.js', { basedir: basedir })
    .on('log', gutil.log.bind(gutil))
    .on('error', onerror)
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('build'));
});

gulp.task('watch', ['clean'], function (cb) {
  reduce.watch()
    .on('log', gutil.log.bind(gutil))
    .on('error', onerror)
    .src('*.js', { basedir: basedir })
    .pipe(buffer)
    .pipe(uglify)
    .pipe(gulp.dest, 'build');
});

gulp.task('lazypipe', ['clean'], function () {
  return reduce.src('*.js', { basedir: basedir, factor: factorOpts })
    .on('log', gutil.log.bind(gutil))
    .on('error', onerror)
    .pipe(postTransforms());
});

gulp.task('lazypipe.watch', ['clean'], function (cb) {
  reduce.watch()
    .on('log', gutil.log.bind(gutil))
    .on('error', onerror)
    .src('*.js', { basedir: basedir, factor: factorOpts })
    .pipe(postTransforms);
});

gulp.task('factor', ['clean'], function () {
  return reduce.src('*.js', { basedir: basedir, factor: factorOpts })
    .on('log', gutil.log.bind(gutil))
    .on('error', onerror)
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('build'));
});

gulp.task('factor.watch', ['clean'], function (cb) {
  reduce.watch()
    .on('log', gutil.log.bind(gutil))
    .on('error', onerror)
    .src('*.js', { basedir: basedir, factor: factorOpts })
    .pipe(buffer)
    .pipe(uglify)
    .pipe(gulp.dest, 'build');
});

