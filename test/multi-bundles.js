'use strict'

const reduce = require('..')
const test = require('tap').test
const fs = require('fs')
const runSequence = require('callback-sequence').run
const browserify = require('browserify')
const path = require('path')
const del = require('del')

const fixtures = path.resolve.bind(path, __dirname)
const dest = fixtures.bind(null, 'build')
const expect = fixtures.bind(null, 'expected', 'multi-bundles')

test('multiple bundles', function(t) {
  return runSequence([clean, bundle]).then(function () {
    t.equal(
      read(dest('common.js')),
      read(expect('common.js')),
      'common.js'
    )
    t.equal(
      read(dest('green.js')),
      read(expect('green.js')),
      'green.js'
    )
    t.equal(
      read(dest('red.js')),
      read(expect('red.js')),
      'red.js'
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
  let basedir = fixtures('src', 'multi-bundles')
  let b = browserify({ basedir: basedir })
  return reduce.src('*.js', { cwd: basedir })
    .pipe(reduce.bundle(b, {
      groups: '**/+(green|red).js',
      common: 'common.js',
    }))
    .pipe(reduce.dest(dest()))
}

