'use strict'

const reduce = require('reduce-js')
const del = require('del')

const basedir = __dirname + '/src'
const build = __dirname + '/build'
del(build).then(function () {
  let b = reduce.create({
    basedir: basedir,
    entries: ['a.js', 'b.js'],
  })

  b.on('error', err => console.log(err))
  b.on('common.map', map => console.log(map))

  b.plugin(reduce.bundler, 'bundle.js')
  b.bundle().pipe(reduce.dest(build))
})

