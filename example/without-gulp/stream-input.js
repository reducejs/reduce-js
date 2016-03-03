'use strict'

const reduce = require('../..')
const browserify = require('browserify')
const del = require('del')
const fs = require('fs')
const source = require('vinyl-source-stream')

const basedir = __dirname + '/src'
const build = __dirname + '/build'
del(build).then(function () {
  let b = browserify({ basedir: basedir })

  b.on('error', err => console.log(err))
  b.on('common.map', map => console.log(map))

  let file = basedir + '/a.js'
  fs.createReadStream(file)
    .pipe(source(file))
    .pipe(reduce.bundle(b, 'bundle.js'))
    .pipe(reduce.dest(build))
})

