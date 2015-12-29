var reduce = require('../..')
var gulp = require('gulp')
var path = require('path')
var del = require('del')
var gutil = require('gulp-util')

gulp.task('clean', function () {
  return del(path.join(__dirname, 'build'))
})

gulp.task('build', ['clean'], function () {
  return src(reduce)
    .pipe(gulp.dest('build'))
})

gulp.task('watch', ['clean'], function (cb) {
  return src(reduce.watch())
    .pipe(gulp.dest, 'build')
})

function src(r) {
  r.on('log', function (msg) {
    gutil.log(msg)
  })
  r.on('error', function (err) {
    gutil.log(err.stack)
  })
  return r.src({
    entries: ['page/hello/index.js', 'page/hi/index.js'],
    bundleOptions: 'bundle.js',
    basedir: path.join(__dirname, 'src'),
    paths: [path.join(__dirname, 'src', 'web_modules')],
  })
}

