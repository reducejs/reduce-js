'use strict'

const reduce = require('..')
const fs = require('fs')
const test = require('tap').test
const path = require('path')
const del = require('del')
const browserify = require('browserify')

const fixtures = path.resolve.bind(path, __dirname)
const dest = fixtures.bind(null, 'build')
const expect = fixtures.bind(null, 'expected', 'single-bundle')

test('single bundle', function(t) {
  del(dest()).then(function () {
    let basedir = fixtures('src', 'single-bundle')
    let b = browserify({ basedir: basedir })
    reduce.src(['green.js', 'red.js'], { cwd: basedir })
      .pipe(reduce.bundle(b, 'bundle.js'))
      .pipe(reduce.dest(dest()))
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

