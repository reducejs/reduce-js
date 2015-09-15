var factor = require('factor-bundle');
var source = require('vinyl-source-stream');
var path = require('path');
var pick = require('util-mix/pick');
var unpick = require('util-mix/unpick');

var createThreshold = require('./threshold');

module.exports = function (b, opts) {
  opts = opts || {};
  var outputs = opts.outputs;
  var basedir = opts.basedir;

  var bentries = b._options.entries.map(abs);

  function abs(e) {
    return path.resolve(b._options.basedir, e);
  }

  var entries;
  var commonFilter;
  if (opts.entries) {
    var entryMap = bentries.reduce(function (o, e) {
      o[e] = true;
      return o;
    }, {});
    entries = typeof opts.entries === 'function'
      ? bentries.filter(opts.entries)
      : pick(opts.entries.map(abs), entryMap);
    commonFilter = unpick(entries, entryMap);
  } else {
    entries = bentries;
    commonFilter = [];
  }

  b.plugin(factor, {
    basedir: basedir,
    entries: entries,
    outputs: function () {
      var outs = typeof outputs === 'function' ? outputs() : outputs;
      var streams = [].concat(outs).map(function (o) {
        return source(o, basedir);
      });
      b.emit('factor.outputs', streams);
      return streams;
    },
    threshold: createThreshold(opts.threshold, commonFilter),
  });
};

