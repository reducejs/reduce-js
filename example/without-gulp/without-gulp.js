var reduce = require('../..')
var path = require('path')
var gutil = require('gulp-util')

var basedir = path.join(__dirname, 'src')
var bundleOpts = {
  groups: '**/+(a|b).js',
  common: 'common.js',
}

var del = require('del')

reduce.run([clean, bundle]).then(function () {
  gutil.log('DONE')
})

function clean() {
  return del(path.join(__dirname, 'build'))
}

function bundle() {
  return reduce
    .on('log', gutil.log.bind(gutil))
    .on('error', gutil.log.bind(gutil))
    .src('*.js', {
      basedir: basedir,
      bundleOptions: bundleOpts,
    })
    .pipe(reduce.dest('build'))
}

