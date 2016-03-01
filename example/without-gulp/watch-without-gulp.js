'use strict'

const reduce = require('../..')
const path = require('path')
const browserify = require('browserify')
const del = require('del')

del(path.join(__dirname, 'build')).then(function () {
  let basedir = path.join(__dirname, 'src')
  let b = browserify({ basedir: basedir })

  b.on('log', console.log.bind(console))
  b.on('error', console.log.bind(console))

 let bundleOpts = {
    groups: '+(a|b|d).js',
    common: 'common.js',
  }

  b.on('bundle-stream', function (bundleStream) {
    bundleStream.pipe(reduce.dest('build'))
  })
  reduce.src('*.js', { cwd: basedir })
    .pipe(reduce.watch(b, bundleOpts, { entryGlob: '*.js' }))
})

