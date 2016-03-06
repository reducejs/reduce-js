'use strict'

const reduce = require('reduce-js')
const gulp = require('gulp')
const path = require('path')
const del = require('del')

gulp.task('clean', function () {
  return del(path.join(__dirname, 'build'))
})

gulp.task('build', ['clean'], function () {
  let basedir = path.join(__dirname, 'src')
  let b = reduce.create({
    basedir: basedir,
    paths: [path.join(basedir, 'web_modules')],
  })

  // As multiple bundles are created,
  // it is important to deal with duplicates carefully.
  // There are known issues caused in such cases.
  // See https://github.com/substack/factor-bundle/issues/51
  // This plugin will just disable the default dedupe transform.
  b.plugin('dedupify')
  b.on('dedupify.deduped', function (o) {
    console.warn('Duplicates of modules found!', o.file, o.dup)
  })

  return gulp.src('page/**/index.js', { cwd: basedir })
    .pipe(reduce.bundle(b, {
      // This object is passed to `common-bundle`.
      groups: 'page/**/index.js',
      common: 'common.js',
    }))
    .pipe(gulp.dest('build'))
})

gulp.task('watch', ['clean'], function () {
  let clean = require('clean-remains')([])
  let basedir = path.join(__dirname, 'src')
  let b = reduce.create({
    basedir: basedir,
    paths: [path.join(basedir, 'web_modules')],
    cache: {},
    packageCache: {},
  })
  b.plugin('dedupify')
  b.on('dedupify.deduped', function (o) {
    console.warn('Duplicates of modules found!', o.file, o.dup)
  })
  return gulp.src('page/**/index.js', { cwd: basedir })
    .pipe(reduce.watch(b, {
      groups: 'page/**/index.js',
      common: 'common.js',
    }, { entryGlob: 'page/**/index.js' }))
    .on('bundle', function (bundleStream) {
      bundleStream
        .pipe(gulp.dest('build'))
        // This plugin will remove files created in the building history but no longer in the newest build.
        .pipe(clean())
        .on('data', file => console.log('bundle:', file.relative))
        .on('end', () => console.log('-'.repeat(40)))
    })
})

