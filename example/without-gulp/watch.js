'use strict'

const reduce = require('../..')
const path = require('path')
const del = require('del')

const basedir = __dirname + '/src'
const build = __dirname + '/build'
del(build).then(function () {
  let b = reduce.create({
    basedir,
    cache: {},
    packageCache: {},
    fileCache: {},
  })

  b.on('error', err => console.log(err))
  b.on('common.map', map => console.log(map))

  b.on('bundle-stream', function (bundleStream) {
    bundleStream.pipe(reduce.dest(build))
  })
  reduce.src('*.js', { cwd: basedir })
    .pipe(reduce.watch(b, 'bundle.js', { entryGlob: '*.js' }))
})

