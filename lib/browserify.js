var browserify = require('browserify');
var glob = require('xglob');

var unpick = require('util-mix/unpick');
var mix = require('util-mix/mix-undef');

var dedupify = require('./dedupify');
var factor = require('./factor');

module.exports = function (pattern, opts) {
  opts = opts || {};
  var bopts = unpick(['factor'], opts);
  bopts.basedir = bopts.basedir || process.cwd();
  // necessary for watch
  bopts.cache = bopts.cache || {};
  bopts.packageCache = bopts.packageCache || {};

  var entries = glob.sync(pattern, { cwd: bopts.basedir });
  var b = browserify(entries, bopts);

  b.plugin(dedupify);

  var factorOpts = opts.factor || {};
  if (factorOpts.outputs) {
    mix(factorOpts, {
      basedir: bopts.basedir,
      entries: entries,
    });
    b.plugin(factor, factorOpts);
  }
  b._options.factor = factorOpts;

  return b;
};

