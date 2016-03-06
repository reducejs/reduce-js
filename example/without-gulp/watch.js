'use strict'

const reduce = require('reduce-js')
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
  b.on('error', err => console.log(err.stack))

  reduce.src('*.js', { cwd: basedir })
    .pipe(reduce.watch(b, 'bundle.js', { entryGlob: '*.js' }))
    .on('bundle', function (bundleStream) {
      bundleStream.pipe(reduce.dest(build))
      .on('data', file => console.log('bundle:', file.relative))
      .on('end', () => console.log('-'.repeat(40)))
    })
})

