var browserify = require('browserify')
var glob = require('globby')

var bundler = require('./bundler')

module.exports = function (entries, opts) {
  if (typeof entries === 'string' || Array.isArray(entries)) {
    opts = opts || {}
    entries = glob.sync(entries, {
      cwd: opts.basedir || process.cwd(),
    })
  } else {
    opts = entries || {}
    entries = []
  }
  opts.cache = opts.cache || {}
  opts.packageCache = opts.packageCache || {}

  var b = browserify(entries, opts)
  var bundleOptions = opts.bundleOptions || 'bundle.js'

  b.plugin(opts.bundler || bundler, bundleOptions)

  return b
}

