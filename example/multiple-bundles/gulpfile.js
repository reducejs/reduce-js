var gulp = require('gulp')
var reduce = require('../..')
var path = require('path')
var uglify = require('gulp-uglify')
var del = require('del')

var onerror = function (err) {
  console.log(err.message)
}

var bundleOpts = {
  // Options passed to `factor-vinylify`
  // Refer to `https://github.com/zoubin/factor-vinylify#options` for more information.
  factor: {
    // One bundle for each entry detected from `.src()`.
    needFactor: true,

    // If omitted, no common bundle will be created.
    common: 'common.js',
  },

  // And all options passed to `browserify`
  // Refer to `https://github.com/substack/node-browserify#methods` for more information

  basedir: path.join(__dirname, 'src'),

  // Now, we can `require('lib/world')` anywhere under the `src` directory.
  // Otherwise, we have to write relative paths like `require('../../web_modules/lib/world')`
  paths: [path.join(__dirname, 'src', 'web_modules')],
}

gulp.task('clean', function () {
  return del(path.join(__dirname, 'build'))
})

// Pack all JS modules into multiple bundles.
gulp.task('build', ['clean'], function () {
  reduce.on('log', console.log.bind(console))
  reduce.on('error', onerror)

  // The first argument is passed to globby.
  // Refer to `https://github.com/sindresorhus/globby#globbypatterns-options` for more information
  return reduce.src('page/**/index.js', bundleOpts)
    // `pipe` into gulp-plugins
    .pipe(uglify())
    .pipe(gulp.dest('build'))
})

// To keep `watch` unfinished, declare `cb` as the first argument of the task callback
gulp.task('watch', ['clean'], function (cb) {
  var watcher = reduce.watch()
  watcher.on('log', console.log.bind(console))
  watcher.on('error', onerror)

  // The first argument is passed to globby.
  // Refer to `https://github.com/sindresorhus/globby#globbypatterns-options` for more information
  watcher.src('page/**/index.js', bundleOpts)
    // `pipe` into lazy transforms, i.e. functions to create transforms
    .pipe(uglify)
    .pipe(gulp.dest, 'build')
})

