var reduce = require('..');
var test = require('tap').test;
var runSequence = require('callback-sequence').run;
var path = require('path');
var del = require('del');
var gutil = require('gulp-util');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var gulp = require('gulp');
var equal = require('util-equal');

var fixtures = path.resolve.bind(path, __dirname);
var log = gutil.log.bind(gutil);
var dest = fixtures.bind(null, 'build', 'single-bundle');
var expect = fixtures.bind(null, 'expected', 'single-bundle');

test('single bundle', function(t) {
  t.plan(1);
  runSequence(
    [clean, bundle],
    function () {
      equal(
        dest('common.js'),
        expect('common.js'),
        function (res) {
          t.ok(res);
        }
      );
    }
  );
});

function clean() {
  return del(dest());
}

function bundle() {
  return reduce.src('*.js', { basedir: fixtures('src', 'single-bundle') })
    .on('log', log)
    .on('error', log)
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(dest()));
}
