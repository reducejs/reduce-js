var source = require('vinyl-source-stream');
var merge = require('merge-stream');
var Transform = require('stream').Transform;

module.exports = function (b, opts) {
  var stream = merge();

  var common = opts.common || 'common.js';
  function handleError(err) {
    Object.keys(err).forEach(function (k) {
      var t = typeof err[k];
      if (t !== 'string' && t !== 'number') {
        delete err[k];
      }
    });
    stream.emit('error', err);
  };

  stream.add(
    b.bundle()
    .on('error', handleError)
    .pipe(source(common, opts.basedir))
    .on('error', handleError)
  );

  if (opts.outputs) {
    var wait = createTransform();
    stream.add(wait);
    b.once('factor.outputs', function (s) {
      s.on('error', handleError);
      stream.add(s);
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

