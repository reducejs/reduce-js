'use strict'

const reduce = require('..')
const fs = require('fs')
const test = require('tap').test
const path = require('path')
const del = require('del')

const fixtures = path.resolve.bind(path, __dirname)
const dest = fixtures.bind(null, 'build')
const expect = fixtures.bind(null, 'expected', 'single-bundle')

test('single bundle', function(t) {
  del.sync(dest())
  let basedir = fixtures('src', 'single-bundle')
  let b = reduce.create(
    ['green.js', 'red.js'],
    { basedir: basedir },
    'bundle.js'
  )
  b.bundle().pipe(b.dest(dest())).on('end', function () {
    t.equal(
      read(dest('bundle.js')),
      read(expect('bundle.js')),
      'bundle.js'
    )
    t.end()
  })
})

function read(file) {
  return fs.readFileSync(file, 'utf8')
}

