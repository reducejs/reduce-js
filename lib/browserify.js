var browserify = require('browserify')
var glob = require('globby')
var exclude = require('mixy').exclude

var bundler = require('./bundler')

module.exports = function (pattern, opts) {
  opts = opts || {}
  var bopts = exclude(['bundleOptions'], opts)
  bopts.basedir = bopts.basedir || process.cwd()

  var entries = glob.sync(pattern, { cwd: bopts.basedir })
  var b = browserify(entries, bopts)

  b.plugin(opts.bundler || bundler, opts.bundleOptions || 'bundle.js')

  return b
}

