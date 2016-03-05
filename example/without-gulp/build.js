'use strict'

const reduce = require('../..')
const del = require('del')

const basedir = __dirname + '/src'
const build = __dirname + '/build'
del(build).then(function () {
  let b = reduce.create({ basedir: basedir })

  b.on('error', err => console.log(err))
  b.on('common.map', map => console.log(map))

  reduce.src('*.js', { cwd: basedir })
    .pipe(reduce.bundle(b, 'bundle.js'))
    .pipe(reduce.dest(build))
})

