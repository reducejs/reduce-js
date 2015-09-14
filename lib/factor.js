var factor = require('post-factor-bundle');
var source = require('vinyl-source-stream');
var merge = require('merge-stream');

var createThreshold = require('./threshold');

module.exports = function (b, opts) {
  opts = opts || {};
  var outputs = opts.outputs;
  var basedir = opts.basedir;

  b.plugin(factor, {
    basedir: basedir,
    entries: opts.entries,
    outputs: function () {
      var outs = typeof outputs === 'function' ? outputs() : outputs;
      return [].concat(outs).map(function (o) {
        return source(o, basedir);
      });
    },
    threshold: createThreshold(opts.threshold, opts.commonFilter),
  });

  b.on('factor.pipelines', function (files, pipelines, outputs) {
    var stream = merge(outputs);
    function handleError(err) {
      stream.emit('error', err);
    }
    outputs.forEach(function (s) {
      s.on('error', handleError);
    });
    b.emit('factor.outputs', stream);
  });
};

