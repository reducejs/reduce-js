'use strict'

const browserify = require('browserify')
const vfs = require('vinyl-fs')
const buffer = require('vinyl-buffer')
const glob = require('globby')

function bundler(b, opts) {
  b.plugin(require('common-bundle'), opts)
  b.on('reset', function reset() {
    b.pipeline.push(buffer())
    return reset
  }())
  b.on('bundle', output => {
    output.on('error', err => delete err.stream)
  })
}

function watchify(b, opts) {
  b.plugin(require('watchify2'), opts)
  var close = b.close
  b.close = function () {
    close()
    b.emit('close')
  }
}

function create(entries, opts, bundleOptions, watchOpts) {
  if (typeof entries !== 'string' && !Array.isArray(entries)) {
    watchOpts = bundleOptions
    bundleOptions = opts
    opts = entries
    entries = null
  }
  opts = opts || {}
  var b = browserify(opts)
  if (entries) {
    glob.sync(entries, { cwd: b._options.basedir }).forEach(function (file) {
      b.add(file)
    })
  }
  b.plugin(bundler, bundleOptions)
  if (watchOpts) {
    b.plugin(watchify, typeof watchOpts === 'object' ? watchOpts : {})
  }
  b.dest = vfs.dest
  return b
}

module.exports = {
  bundler,
  watchify,
  create,
}

