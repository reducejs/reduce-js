'use strict'

const reduce = require('reduce-js')
const del = require('del')

const basedir = __dirname + '/src'
const build = __dirname + '/build'
del(build).then(function () {
  let b = reduce.create({ basedir: basedir })
  b.on('error', err => console.log(err))

  reduce.src('*.js', { cwd: basedir })
    .pipe(reduce.bundle(b, 'bundle.js'))
    .pipe(reduce.dest(build))
    .on('data', file => console.log('bundle:', file.relative))
    .on('end', () => console.log('DONE'))
})

