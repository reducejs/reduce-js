var Reduce = require('./lib/reduce')
exports = module.exports = Reduce()
exports.Reduce = Reduce.bind(null)
exports.watch = require('./lib/watch')
exports.lazypipe = require('lazypipe')
exports.dest = require('vinyl-fs').dest
exports.run = require('callback-sequence').run

