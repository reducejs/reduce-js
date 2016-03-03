'use strict'

const stream = require('stream')
const vfs = require('vinyl-fs')
const concat = require('concat-stream')

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
    function write(file, enc, next) {
      if (file.isNull()) {
        b.add(file.path)
        return next()
      }

      if (file.isStream()) {
        return file.contents.pipe(concat(function (buf) {
          file.contents = buf
          write(file, enc, next)
        }))
      }

      b.add({
        file: file.path,
        source: file.contents.toString('utf8'),
      })
      next()
    },
    function (next) {
      b.bundle()
        .on('data', data => this.push(data))
        .on('end', next)
    }
  )
}

function watch(b, opts, wopts) {
  b.plugin(bundler, opts)
  b.plugin(watcher, wopts)

  let fileCache = b._options.fileCache
  b.on('update', function (deps) {
    if (fileCache) {
      deps.forEach(file => delete fileCache[file])
    }
  })

  return through(
    function write(file, enc, next) {
      if (file.isNull()) {
        b.add(file.path)
        return next()
      }

      if (file.isStream()) {
        return file.contents.pipe(concat(function (buf) {
          file.contents = buf
          write(file, enc, next)
        }))
      }

      if (fileCache) {
        fileCache[file.path] = file.contents.toString('utf8')
      }
      // Watch file.path
      b.emit('file', file.path)
      b.add(file.path)
      next()
    },
    function (next) {
      b.once('close', next)
      b.start()
    }
  )
}

function src(patterns, opts) {
  return vfs.src(patterns, Object.assign({ read: false }, opts))
}

module.exports = {
  bundler,
  watcher,
  bundle,
  watch,
  dest: vfs.dest,
  src,
}

