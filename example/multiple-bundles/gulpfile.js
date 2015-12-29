var reduce = require('../..')
var gulp = require('gulp')
var path = require('path')
var del = require('del')
var gutil = require('gulp-util')

gulp.task('clean', function () {
  return del(path.join(__dirname, 'build'))
})

// Pack all JS modules into multiple bundles.
gulp.task('build', ['clean'], function () {
  return src(reduce)
    // `pipe` into gulp-plugins
    .pipe(gulp.dest('build'))
})

// To keep `watch` unfinished, declare `cb` as the first argument of the task callback
gulp.task('watch', ['clean'], function (cb) {
  return src(reduce.watch())
    // `pipe` into lazy transforms, i.e. functions to create transforms
    .pipe(gulp.dest, 'build')
})

function src(r) {
  r.on('log', function (msg) {
    gutil.log(msg)
  })
  r.on('error', function (err) {
    gutil.log(err.stack)
  })
  // The first argument is passed to globby.
  // Refer to `https://github.com/sindresorhus/globby#globbypatterns-options` for more information
  return r.src('page/**/index.js', {
    // Options passed to `common-bundle`
    // Refer to `https://github.com/zoubin/common-bundle` for more information.
    bundleOptions: {
      // One bundle for each index.js
      groups: '**/page/**/index.js',

      // If omitted, no common bundle will be created.
      // common: {
      //   // File path of the common bundle
      //   output: 'common.js',
      //   // Make the common bundle from all bundles
      //   filter: '**/*.js',
      // },
      common: 'common.js',
    },

    // And all options passed to `browserify`
    // Refer to `https://github.com/substack/node-browserify#methods` for more information

    basedir: path.join(__dirname, 'src'),

    // Now, we can `require('lib/world')` anywhere under the `src` directory.
    // Otherwise, we have to write relative paths like `require('../../web_modules/lib/world')`
    paths: [path.join(__dirname, 'src', 'web_modules')],
  })
}

