var reduce = require('..')
var fs = require('fs')
var test = require('tap').test
var runSequence = require('callback-sequence').run
var path = require('path')
var del = require('del')

var fixtures = path.resolve.bind(path, __dirname)
var dest = fixtures.bind(null, 'build')
var expect = fixtures.bind(null, 'expected', 'single-bundle')

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
  return reduce.src('*.js', {
    basedir: fixtures('src', 'single-bundle'),
    //bundleOptions: 'bundle.js',
  })
  .pipe(reduce.dest(dest()))
}

