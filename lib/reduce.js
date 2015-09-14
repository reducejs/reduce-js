var browserify = require('./browserify');
var bundle = require('./bundle');

var inherits = require('util').inherits;
// node version?
var EE = require('events');
inherits(Reduce, EE);

module.exports = Reduce;

function Reduce() {
  if (!(this instanceof Reduce)) {
    return new Reduce();
  }
}

Reduce.prototype.src = function(pattern, opts) {
  var b = browserify(pattern, opts);
  var onerror = this.emit.bind(this, 'error');

  b.on('log', this.emit.bind(this, 'log'));
  b.on('error', onerror);

  return bundle(b, b._options.factor).on('error', onerror);
};

