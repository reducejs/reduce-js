'use strict'

const reduce = require('..')
const fs = require('fs')
const test = require('tap').test
const path = require('path')
const del = require('del')
const browserify = require('browserify')
const source = require('vinyl-source-stream')

const fixtures = path.resolve.bind(path, __dirname)
const dest = fixtures.bind(null, 'build')
const expect = fixtures.bind(null, 'expected', 'stream')

test('source', function(t) {
  del(dest()).then(function () {
    let basedir = fixtures('src', 'single-bundle')
    let b = browserify({
      basedir: basedir,
      fileCache: {},
    })
    let file = basedir + '/green.js'
    fs.createReadStream(file)
      .pipe(source(file))
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

