var source = require('vinyl-source-stream');
var merge = require('merge-stream');
var Transform = require('stream').Transform;

module.exports = function (b, opts) {
  var stream = merge();

  function handleError(err) {
    Object.keys(err).forEach(function (k) {
      var t = typeof err[k];
      if (t !== 'string' && t !== 'number') {
        delete err[k];
      }
    });
    stream.emit('error', err);
  }

  var common = b.bundle().on('error', handleError);
  if (opts.common || !opts.outputs) {
    stream.add(
      common.pipe(source(opts.common || 'common.js', opts.basedir))
        .on('error', handleError)
    );
  }

  if (opts.outputs) {
    var wait = createTransform();
    stream.add(wait);
    b.once('factor.outputs', function (streams) {
      streams.forEach(function (s) {
        s.on('error', handleError);
      });
      stream.add(streams);
      wait.end();
    });
  }

  return stream;
};

function createTransform() {
  var ts = Transform({ objectMode: true });
  ts._transform = function () {};
  return ts;
}

