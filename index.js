'use strict'

const stream = require('stream')
const vfs = require('vinyl-fs')

function bundler(b, opts) {
  if (typeof opts === 'function' || Array.isArray(opts)) {
    return b.plugin(opts)
  }

  opts = opts || {}
  if (typeof opts === 'string') {
    opts = { groups: { output: opts } }
  }
  b.plugin(require('common-bundle'), opts)
}

function through(write, end) {
  return stream.Transform({
    objectMode: true,
    transform: write,
    flush: end,
  })
}

function watcher(b, wopts) {
  b.plugin(require('watchify2'), wopts)
  let close = b.close
  b.close = function () {
    close()
    b.emit('close')
  }
  b.start = function () {
    b.emit('bundle-stream', b.bundle())
  }
  b.on('update', b.start)
}

function bundle(b, opts) {
  b.plugin(bundler, opts)

  return through(
    function (file, enc, next) {
      b.add(file.path)
      next()
    },
    function (next) {
      b.bundle()
        .on('data', data => this.push(data))
        .on('end', next)
        .on('error', err => b.emit('error', err))
    }
  )
}

function watch(b, opts, wopts) {
  b.plugin(bundler, opts)
  b.plugin(watcher, wopts)

  return through(
    function (file, enc, next) {
      b.add(file.path)
      next()
    },
    function (next) {
      b.once('close', next)
      b.start()
    }
  )
}

function src(pattern, opts) {
  opts = opts || {}
  opts.read = false
  return vfs.src(pattern, opts)
}

module.exports = {
  bundler,
  watcher,
  bundle,
  watch,
  dest: vfs.dest,
  src,
}

