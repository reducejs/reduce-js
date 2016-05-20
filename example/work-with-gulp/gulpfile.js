'use strict'

const reduce = require('reduce-js')
const gulp = require('gulp')
const path = require('path')
const del = require('del')
const uglify = require('gulp-uglify')
const gutil = require('gulp-util')
const Transform = require('stream').Transform

gulp.task('build', function () {
  return bundle(createBundler())
})

gulp.task('watch', function (cb) {
  var b = createBundler(true)
  b.on('update', function update() {
    bundle(b)
    return update
  }())
  b.on('close', cb)
})

function createBundler(watch) {
  var b = reduce.create(
    /* glob for entries */
    'page/**/index.js',

    /* options for depsify */
    {
      basedir: path.join(__dirname, 'src'),
      cache: {},
      packageCache: {},
    },

    /* options for common-bundle */
    // single bundle
    // 'bundle.js',
    // multiple bundles
    {
      groups: 'page/**/index.js',
      common: 'common.js',
    },

    /* options for watchify2 */
    watch && { entryGlob: 'page/**/index.js' }
  )
  return b
}

function bundle(b) {
  var startTime = Date.now()
  log('Start bundling')
  var build = path.join(__dirname, 'build')
  del.sync(build)
  return b.bundle().on('error', log)
    .pipe(Transform({
      objectMode: true,
      transform: function (file, enc, next) {
        log('-', file.relative, file.contents.length, 'bytes')
        next(null, file)
      }
    }))
    .pipe(uglify())
    .pipe(b.dest(build))
    .on('end', () => log('End bundling in', Date.now() - startTime, 'ms'))
}

function log() {
  gutil.log.apply(gutil, [].map.call(arguments, function (msg) {
    if (typeof msg === 'string') {
      return msg
    }
    if (msg.stack) {
      return msg.stack
    }
    return JSON.stringify(msg, null, 2)
  }))
}
