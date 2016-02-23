'use strict'

const reduce = require('..')
const fs = require('fs')
const test = require('tap').test
const runSequence = require('callback-sequence').run
const path = require('path')
const del = require('del')
const browserify = require('browserify')

const fixtures = path.resolve.bind(path, __dirname)
const dest = fixtures.bind(null, 'build')
const expect = fixtures.bind(null, 'expected', 'single-bundle')

test('single bundle', function(t) {
  return runSequence([clean, bundle]).then(function () {
    t.equal(
      read(dest('bundle.js')),
      read(expect('bundle.js')),
      'bundle.js'
    )
  })
})

function read(file) {
  return fs.readFileSync(file, 'utf8')
}

function clean() {
  return del(dest())
}

function bundle() {
  let basedir = fixtures('src', 'single-bundle')
  let b = browserify({ basedir: basedir })
  return reduce.src(['green.js', 'red.js'], { cwd: basedir })
    .pipe(reduce.bundle(b))
    .pipe(reduce.dest(dest()))
}

