'use strict'

const reduce = require('../../..')
const gulp = require('gulp')
const path = require('path')
const del = require('del')
const browserify = require('browserify')

gulp.task('clean', function () {
  return del(path.join(__dirname, 'build'))
})

gulp.task('build', ['clean'], function () {
  let b = createBundler()
  return gulp.src('page/**/index.js', { cwd: b._options.basedir })
    .pipe(reduce.bundle(b, {
      groups: 'page/**/index.js',
      common: 'common.js',
    }))
    .pipe(gulp.dest('build'))
})

gulp.task('watch', ['clean'], function (cb) {
  let b = createBundler()
  let clean = require('clean-remains')([])
  b.on('bundle-stream', function (bundleStream) {
    bundleStream
      .pipe(gulp.dest('build'))
      .pipe(clean())
  })
  gulp.src('page/**/index.js', { cwd: b._options.basedir })
    .pipe(reduce.watch(b, {
      groups: 'page/**/index.js',
      common: 'common.js',
    }, { entryGlob: 'page/**/index.js' }))
})

function createBundler() {
  let basedir = path.join(__dirname, 'src')
  let b = browserify({
    basedir: basedir,
    paths: [path.join(basedir, 'web_modules')],
    fileCache: {},
    cache: {},
    packageCache: {},
  })

  b.plugin('dedupify')
  b.on('dedupify.deduped', function (o) {
    console.warn('Duplicates of modules found!', o.file, o.dup)
  })

  b.on('error', console.log.bind(console))
  b.on('common.map', function (map) {
    console.log('bundles:', '[ ' + Object.keys(map).join(', ') + ' ]')
  })

  return b
}

