var lazypipe = require('lazypipe')
var watchify = require('watchify')
var browserify = require('./browserify')
var inherits = require('util').inherits
var run = require('callback-sequence').run
// node version?
var EE = require('events')
inherits(Watch, EE)

module.exports = Watch

function Watch(opts) {
  if (!(this instanceof Watch)) {
    return new Watch(opts)
  }
  this.options = opts
  this._lazypipe = lazypipe()
}

Watch.prototype.src = function(pattern, opts) {
  opts = opts || {}
  opts.cache = opts.cache || {}
  opts.packageCache = opts.packageCache || {}
  var b = browserify(pattern, opts)
  watchify(b, this.options)

  var onerror = this.emit.bind(this, 'error')
  var self = this
  function _bundle() {
    return b.bundle()
      .on('error', onerror)
      .pipe(self._lazypipe())
  }

  function bundle() {
    run(_bundle).then(function () {
      // hook on bundle-finish
      self.emit('done')
    }, function (err) {
      self.emit('error', err)
    })
  }

  b.on('log', this.emit.bind(this, 'log'))
  b.on('error', onerror)
  b.on('update', bundle)

  this.emit('instance', b)
  this.once('close', b.close.bind(b))

  // allow lazypipe
  process.nextTick(bundle)

  return this
}

Watch.prototype.close = function() {
  this.emit('close')
}

Watch.prototype.pipe = function() {
  this._lazypipe = this._lazypipe.pipe.apply(this._lazypipe, arguments)
  return this
}

