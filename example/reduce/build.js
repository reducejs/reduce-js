'use strict'

const reduce = require('reduce-js')
const path = require('path')
const del = require('del')
const uglify = require('gulp-uglify')

var i = process.argv.indexOf('-w')
if (i === -1) {
  i = process.argv.indexOf('--watch')
}
var needWatch = i > -1
if (needWatch) {
  var b = createBundler(true)
  b.on('update', function update() {
    bundle(b)
    return update
  }())
} else {
  bundle(createBundler())
}
function createBundler(watch) {
  var b = reduce.create(
    /* glob for entries */
    '*.js',

    /* options for depsify */
    {
      basedir: path.join(__dirname, 'src'),
      cache: {},
      packageCache: {},
    },

    /* options for common-bundle */
    // single bundle
    // 'bundle.js',
    // multiple bundles
    {
      groups: '*.js',
      common: 'common.js',
    },

    /* options for watchify2 */
    watch && { entryGlob: '*.js' }
  )
  return b
}

function bundle(b) {
  var build = path.join(__dirname, 'build')
  del.sync(build)
  return b.bundle().pipe(uglify()).pipe(b.dest(build))
}

