'use strict'

const reduce = require('..')
const fs = require('fs')
const test = require('tap').test
const path = require('path')
const del = require('del')

const fixtures = path.resolve.bind(path, __dirname)
const dest = fixtures.bind(null, 'build')
const expect = fixtures.bind(null, 'expected', 'single-bundle')
const gulp = require('gulp')

test('gulp', function(t) {
  del(dest()).then(function () {
    let basedir = fixtures('src', 'single-bundle')
    let b = reduce.create({ basedir: basedir })
    gulp.src(['green.js', 'red.js'], { cwd: basedir })
      .pipe(reduce.bundle(b, 'bundle.js'))
      .pipe(gulp.dest(dest()))
      .on('finish', function () {
        t.equal(
          read(dest('bundle.js')),
          read(expect('bundle.js')),
          'bundle.js'
        )
        t.end()
      })
  })
})

function read(file) {
  return fs.readFileSync(file, 'utf8')
}

