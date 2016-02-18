# reduce-js
[![version](https://img.shields.io/npm/v/reduce-js.svg)](https://www.npmjs.org/package/reduce-js)
[![status](https://travis-ci.org/reducejs/reduce-js.svg?branch=master)](https://travis-ci.org/reducejs/reduce-js)
[![dependencies](https://david-dm.org/reducejs/reduce-js.svg)](https://david-dm.org/reducejs/reduce-js)
[![devDependencies](https://david-dm.org/reducejs/reduce-js/dev-status.svg)](https://david-dm.org/reducejs/reduce-js#info=devDependencies)

A sugar wrapper for [`browserify`].

**Features**:

* Accept patterns for detecting entries.
* Use [`watchify2`] to update bundles whenever file changes. And new entries can be detected.
* Use [`common-bundle`] to pack modules by default.
* Easy to work with [`gulp`].

## Example
Check more [examples](example/).

```javascript
var gulp = require('gulp')
var reduce = require('reduce-js')
var path = require('path')
var del = require('del')
var gutil = require('gulp-util')

gulp.task('clean', function () {
  return del(path.join(__dirname, 'build'))
})

// Pack all JS modules into multiple bundles.
gulp.task('build', ['clean'], function () {
  return src(reduce)
    // `pipe` into gulp-plugins
    .pipe(gulp.dest('build'))
})

// To keep `watch` unfinished, declare `cb` as the first argument of the task callback
gulp.task('watch', ['clean'], function (cb) {
  return src(reduce.watch())
    // `pipe` into lazy transforms, i.e. functions to create transforms
    .pipe(gulp.dest, 'build')
})

function src(r) {
  r.on('log', function (msg) {
    gutil.log(msg)
  })
  r.on('error', function (err) {
    gutil.log(err.stack)
  })
  return r.src('page/**/index.js', {
    // Options passed to `common-bundle`
    bundleOptions: {
      // One bundle for each index.js
      groups: '**/page/**/index.js',

      // Common modules shared by all pages are packed into 'common.js'
      common: 'common.js',
    },

    basedir: path.join(__dirname, 'src'),
  })
}

```

## API

### reduce.src(patterns, bopts)
Create a stream flowing [`vinyl`] file objects,
which represents bundles created.

**patterns**

Type: `String`, `Array`

Used by [`globby`] to locate entries.

**bopts**

Options to create the [`browserify`] instance.

Fields not explained in the following sections
are the same with [`browserify`].

**bopts.basedir**

Type: `String`

Default: `process.cwd()`

Used as the `cwd` field of the options passed to [`globby`].

**bopts.bundleOptions**

Type: `Object`

Options passed to [`common-bundle`].

### r = reduce.Reduce()
Create a new reduce instance.

### w = reduce.watch(watchifyOpts)
Creates a watch instance.

`watchifyOpts` will be passed to [`watchify`].

`w.src(pattern, opts)`:
The same with `reduce.src`.

`w.pipe(fn, arg1, arg2,...)`: Like [`lazypipe`].
Pass the stream constructor and its arguments to `.pipe`,
and they will be called to create a pipeline
for transforming the output stream.

### reduce.dest
The same with [`gulp.dest`].

### reduce.lazypipe
The same with [`lazypipe`].

### reduce.run
The same with [`callback-sequence#run`].

### Events

`reduce.on('instance', (b) => {})`

`b` is the [`browserify`] instance.

```javascript

reduce.on('instance', function (b) {
  b.transform(envify)
})
.src('*.js', opts)
.pipe(reduce.dest('build'))

```

`reduce.watch().on('instance', (b) => {})`

## Without [`gulp`]
If you are not using [`gulp`],
use `reduce.dest` instead of [`gulp.dest`] to write bundles into the disk.
Also, you can use `reduce.run` to run the task.

```javascript
var reduce = require('reduce-js');
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

```

[`browserify`]: https://www.npmjs.com/package/browserify
[`common-bundle`]: https://www.npmjs.com/package/common-bundle
[`vinyl`]: https://www.npmjs.com/package/vinyl
[`gulp`]: https://www.npmjs.com/package/gulp
[`globby`]: https://github.com/sindresorhus/globby
[`watchify`]: https://github.com/substack/watchify
[`watchify2`]: https://github.com/reducejs/watchify2
[`lazypipe`]: https://github.com/OverZealous/lazypipe
[`gulp.dest`]: https://github.com/gulpjs/gulp/blob/master/docs/API.md#gulpdestpath-options
[`callback-sequence#run`]: https://github.com/zoubin/callback-sequence#sequenceruncallbacks-done

