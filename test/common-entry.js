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
var dest = fixtures.bind(null, 'build', 'common-entry');
var expect = fixtures.bind(null, 'expected', 'common-entry');

test('common-entry, browserify entries which are not factor entries should go to common', function(t) {
  t.plan(1);
  runSequence(
    [clean, bundle],
    function () {
      equal(
        [dest('common.js'), dest('green.js'), dest('red.js')],
        [expect('common.js'), expect('green.js'), expect('red.js')],
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
  var opts = {
    basedir: fixtures('src', 'common-entry'),
    factor: {
      entries: ['green.js', 'red.js'],
      outputs: ['green.js', 'red.js'],
      common: 'common.js',
    },
  };
  return reduce.src('*.js', opts)
    .on('log', log)
    .on('error', log)
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(dest()));
}

