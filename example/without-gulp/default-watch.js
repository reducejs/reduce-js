'use strict'

const reduce = require('../..')
const del = require('del')

const basedir = __dirname + '/src'
const build = __dirname + '/build'
del(build).then(function () {
  let b = reduce.create({
    basedir,
    cache: {},
    packageCache: {},
    entries: ['a.js', 'b.js'],
  })

  b.on('error', err => console.log(err))
  b.on('common.map', map => console.log(map))

  b.plugin(reduce.bundler, 'bundle.js')
  b.plugin(reduce.watcher, { entryGlob: '*.js' })
  b.on('bundle-stream', function (bundleStream) {
    bundleStream.pipe(reduce.dest(build))
  })
  b.start()
})

