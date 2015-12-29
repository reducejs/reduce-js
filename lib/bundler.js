var common = require('common-bundle')
var source = require('vinyl-source-stream')
var through = require('through2')

exports = module.exports = function (b, opts) {
  if (typeof opts === 'string') {
    b.plugin(vinylify, { output: opts })
  } else {
    b.plugin(common, opts)
  }
}

function vinylify(b, opts) {
  function hook() {
    b.pipeline.push(source(opts.output))
    b.pipeline.push(through.obj(function (file, _, next) {
      b.emit('log', 'Bundle created: ' + file.relative)
      next(null, file)
    }))
  }
  b.on('reset', hook)
  hook()
}

