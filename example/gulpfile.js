var gulp = require('gulp')
var reduce = require('..')
var path = require('path')
var gutil = require('gulp-util')
var uglify = require('gulp-uglify')
var del = require('del')

var basedir = path.join(__dirname, 'src')

var postTransforms = reduce.lazypipe()
  .pipe(uglify)
  .pipe(gulp.dest, 'build')

var factorOpts = {
  outputs: ['a.js', 'b.js'],
  common: 'common.js',
}

var onerror = function (err) {
  gutil.log(err.message)
}

gulp.task('clean', function () {
  return del(path.join(__dirname, 'build'))
})

gulp.task('single', ['clean'], function () {
  return reduce.src('*.js', { basedir: basedir })
    .on('log', gutil.log.bind(gutil))
    .on('error', onerror)
    .pipe(uglify())
    .pipe(gulp.dest('build'))
})

gulp.task('watch-single', ['clean'], function (cb) {
  reduce.watch()
    .on('log', gutil.log.bind(gutil))
    .on('error', onerror)
    .src('*.js', { basedir: basedir })
    .pipe(uglify)
    .pipe(gulp.dest, 'build')
})

gulp.task('lazypipe', ['clean'], function () {
  return reduce.src('*.js', { basedir: basedir, factor: factorOpts })
    .on('log', gutil.log.bind(gutil))
    .on('error', onerror)
    .pipe(postTransforms())
})

gulp.task('watch-lazypipe', ['clean'], function (cb) {
  reduce.watch()
    .on('log', gutil.log.bind(gutil))
    .on('error', onerror)
    .src('*.js', { basedir: basedir, factor: factorOpts })
    .pipe(postTransforms)
})

gulp.task('multiple', ['clean'], function () {
  return reduce.src('*.js', { basedir: basedir, factor: factorOpts })
    .on('log', gutil.log.bind(gutil))
    .on('error', onerror)
    .pipe(uglify())
    .pipe(gulp.dest('build'))
})

gulp.task('watch-multiple', ['clean'], function (cb) {
  reduce.watch()
    .on('log', gutil.log.bind(gutil))
    .on('error', onerror)
    .src('*.js', { basedir: basedir, factor: factorOpts })
    .pipe(uglify)
    .pipe(gulp.dest, 'build')
})

