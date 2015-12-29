var reduce = require('..')
var test = require('tap').test
var fs = require('fs')
var runSequence = require('callback-sequence').run
var path = require('path')
var del = require('del')

var fixtures = path.resolve.bind(path, __dirname)
var dest = fixtures.bind(null, 'build')
var expect = fixtures.bind(null, 'expected', 'multi-bundles')

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
  var opts = {
    basedir: fixtures('src', 'multi-bundles'),
    bundleOptions: {
      groups: '**/+(green|red).js',
      common: 'common.js',
    },
  }
  return reduce.src('*.js', opts)
    .pipe(reduce.dest(dest()))
}

