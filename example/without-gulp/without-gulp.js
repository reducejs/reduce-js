'use strict'

const reduce = require('../..')
const path = require('path')
const run = require('callback-sequence').run
const browserify = require('browserify')

run([clean, bundle]).then(() => { console.log('DONE') })

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
    groups: '**/+(a|b).js',
    common: 'common.js',
  }

  return reduce.src('*.js', { cwd: basedir })
    .pipe(reduce.bundle(b, bundleOpts))
    .pipe(reduce.dest('build'))
}

