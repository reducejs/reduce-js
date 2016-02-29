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
    groups: '+(a|b).js',
    common: 'common.js',
  }

  reduce.src('*.js', { cwd: basedir })
    .pipe(reduce.bundle(b, bundleOpts))
    .pipe(reduce.dest('build'))
})

