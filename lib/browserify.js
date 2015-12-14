var browserify = require('browserify')
var glob = require('globby')
var exclude = require('mixy').exclude

var vinylify = require('factor-vinylify')

module.exports = function (pattern, opts) {
  opts = opts || {}
  var bopts = exclude(['factor'], opts)
  bopts.basedir = bopts.basedir || process.cwd()

  var entries = glob.sync(pattern, { cwd: bopts.basedir })
  var b = browserify(entries, bopts)

  b.plugin(vinylify, opts.factor)

  return b
}

