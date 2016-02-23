'use strict'

const reduce = require('../..')
const path = require('path')
const run = require('callback-sequence').run
const browserify = require('browserify')

run([clean, bundle])

function clean() {
  let del = require('del')
  return del(path.join(__dirname, 'build'))
}

function bundle() {
  let basedir = path.join(__dirname, 'src')
  let b = browserify({ basedir: basedir })

  b.on('log', console.log.bind(console))
  b.on('error', console.log.bind(console))

 let bundleOpts = {
    groups: '**/+(a|b|d).js',
    common: 'common.js',
  }

  reduce.src('*.js', { cwd: basedir })
    .pipe(reduce.watch(b, bundleOpts, { entryGlob: '*.js' }))
    .pipe(reduce.dest, 'build')
}

