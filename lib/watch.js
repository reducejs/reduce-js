var lazypipe = require('lazypipe');
var watchify = require('watchify');
var browserify = require('./browserify');
var inherits = require('util').inherits;
var run = require('run-callback');
// node version?
var EE = require('events');
inherits(Watch, EE);

module.exports = Watch;

function Watch(opts) {
  if (!(this instanceof Watch)) {
    return new Watch(opts);
  }
  this.options = opts;
}

Watch.prototype.src = function(pattern, opts) {
  var b = browserify(pattern, opts);
  watchify(b, this.options);

  var onerror = this.emit.bind(this, 'error');
  var self = this;
  function _bundle() {
    var s = b.bundle().on('error', onerror);
    if (self._lazypipe) {
      return s.pipe(self._lazypipe());
    }
    return s;
  }

  function bundle() {
    run(_bundle, function (err) {
      if (err) {
        self.emit('error', err);
        return;
      }
      self.emit('change');
    });
  }

  b.on('log', this.emit.bind(this, 'log'));
  b.on('error', onerror);
  b.on('update', bundle);
  process.nextTick(bundle);

  this.b = b;

  return this;
};

Watch.prototype.close = function() {
  this.b.close();
};

Watch.prototype.pipe = function() {
  if (!this._lazypipe) {
    this._lazypipe = lazypipe();
  }
  this._lazypipe = this._lazypipe.pipe.apply(this._lazypipe, arguments);
  return this;
};

