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
  return gulp.src('page/**/index.js', { cwd: basedir })
    .pipe(reduce.bundle(b, 'bundle.js'))
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
  return gulp.src('page/**/index.js', { cwd: b._options.basedir })
    .pipe(reduce.watch(b, 'bundle.js', { entryGlob: 'page/**/index.js' }))
    .on('bundle', function (bundleStream) {
      bundleStream
        .pipe(gulp.dest('build'))
        .pipe(clean())
        .on('data', file => console.log('bundle:', file.relative))
        .on('end', () => console.log('-'.repeat(40)))
    })
})

