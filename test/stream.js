'use strict'

const reduce = require('..')
const fs = require('fs')
const test = require('tap').test
const path = require('path')
const del = require('del')
const browserify = require('browserify')
const File = require('vinyl')

const fixtures = path.resolve.bind(path, __dirname)
const dest = fixtures.bind(null, 'build')
const expect = fixtures.bind(null, 'expected', 'single-bundle')

test('stream', function(t) {
  del(dest()).then(function () {
    let basedir = fixtures('src', 'single-bundle')
    let b = browserify({
      basedir: basedir,
      fileCache: {},
    })
    let pipeline = reduce.bundle(b, 'bundle.js')

    pipeline.write(new File({
      path: basedir + '/green.js',
      contents: fs.createReadStream(basedir + '/green.js'),
    }))
    pipeline.write(new File({
      path: basedir + '/red.js',
      contents: fs.createReadStream(basedir + '/red.js'),
    }))
    pipeline.end()

    pipeline.pipe(reduce.dest(dest())).on('finish', function () {
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

