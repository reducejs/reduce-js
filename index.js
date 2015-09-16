exports = module.exports = require('./lib/reduce')();
exports.watch = require('./lib/watch');
exports.lazypipe = require('lazypipe');
exports.dest = require('vinyl-fs').dest;
exports.run = require('callback-sequence').run;

