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
function dest(file) {
  if (file) {
    return fixtures('build', 'require-entry', file);
  }
  return fixtures('build', 'require-entry');
}
function expect(file) {
  if (file) {
    return fixtures('expected', 'require-entry', file);
  }
  return fixtures('expected', 'require-entry');
}

test('require-entry, entry should not go to common', function(t) {
  t.plan(1);
  runSequence(
    [clean, bundle],
    function () {
      equal(
        ['common.js', 'blue.js', 'blue-red.js'].map(dest),
        ['common.js', 'blue.js', 'blue-red.js'].map(expect),
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
    basedir: fixtures('src', 'require-entry'),
    factor: {
      entries: ['blue.js', 'blue-red.js'],
      outputs: ['blue.js', 'blue-red.js'],
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

