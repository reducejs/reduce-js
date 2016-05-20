'use strict'

const reduce = require('..')
const test = require('tap').test
const fs = require('fs')
const path = require('path')
const del = require('del')

const fixtures = path.resolve.bind(path, __dirname)
const dest = fixtures.bind(null, 'build')
const expect = fixtures.bind(null, 'expected', 'multi-bundles')

test('multiple bundles', function(t) {
  del.sync(dest())
  let basedir = fixtures('src', 'multi-bundles')
  let b = reduce.create(
    '*.js',
    { basedir },
    {
      groups: '+(green|red).js',
      common: 'common.js',
    }
  )
  b.bundle().pipe(b.dest(dest())).on('end', function () {
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
    t.end()
  })
})

function read(file) {
  return fs.readFileSync(file, 'utf8')
}

