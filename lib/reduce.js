var browserify = require('./browserify')
var inherits = require('util').inherits
// node version?
var EE = require('events')
inherits(Reduce, EE)

module.exports = Reduce

function Reduce() {
  if (!(this instanceof Reduce)) {
    return new Reduce()
  }
}

Reduce.prototype.src = function(pattern, opts) {
  var b = browserify(pattern, opts)
  var onerror = this.emit.bind(this, 'error')

  b.on('log', this.emit.bind(this, 'log'))
  b.on('error', onerror)

  this.emit('instance', b)

  return b.bundle().on('error', onerror)
}

