var Reduce = require('./lib/reduce')
exports = module.exports = new Reduce()
exports.Reduce = function () {
  return new Reduce()
}
exports.watch = require('./lib/watch')
exports.lazypipe = require('lazypipe')
exports.dest = require('vinyl-fs').dest
exports.run = require('callback-sequence').run

