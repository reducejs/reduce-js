'use strict'

const stream = require('stream')
const vfs = require('vinyl-fs')

exports.bundle = function (b, opts) {
  bundler(b, opts)

  return stream.Transform({
    objectMode: true,

    transform: function (file, enc, next) {
      b.add(file.path)
      next()
    },

    flush: function (next) {
      b.bundle()
        .on('data', data => this.push(data))
        .on('end', next)
        .on('error', b.emit.bind(b))
    },
  })
}

exports.watch = function (b, opts, wopts) {
  bundler(b, opts)

  let handleError = b.emit.bind(b)
  let transform = []

  function bundle() {
    let s = b.bundle().on('error', handleError)
    transform.forEach(args => {
      s = s.pipe(args[0].apply(null, [].slice.call(args, 1)))
        .on('error', handleError)
    })

    s.on('end', () => b.emit('done'))
  }

  let output = stream.Transform({
    objectMode: true,

    transform: function (file, enc, next) {
      b.add(file.path)
      next()
    },

    flush: function (next) {
      next()
      b.on('update', bundle)
      bundle()
    },
  })
  output.pipe = function () {
    transform.push(arguments)
  }

  b.plugin(require('watchify2'), wopts)

  return output
}

exports.src = function (pattern, opts) {
  opts = opts || {}
  opts.read = false
  return vfs.src(pattern, opts)
}

exports.dest = vfs.dest

exports.bundler = bundler

function bundler(b, opts) {
  if (opts === false) return
  if (typeof opts === 'function' || Array.isArray(opts)) {
    return b.plugin(opts)
  }

  opts = opts || 'bundle.js'
  if (typeof opts === 'string') {
    b.plugin(vinylify, opts)
  } else {
    b.plugin(require('common-bundle'), opts)
  }
}

function vinylify(b, opts) {
  const source = require('vinyl-source-stream')
  function hook() {
    b.pipeline.push(source(opts))
    b.pipeline.push(stream.Transform({
      objectMode: true,

      transform: function (file, enc, next) {
        b.emit('log', 'bundle: ' + file.relative)
        next(null, file)
      },
    }))
  }

  b.on('reset', hook)
  hook()
}

