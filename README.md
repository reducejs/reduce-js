# reduce-js
[![version](https://img.shields.io/npm/v/reduce-js.svg)](https://www.npmjs.org/package/reduce-js)
[![status](https://travis-ci.org/reducejs/reduce-js.svg?branch=master)](https://travis-ci.org/reducejs/reduce-js)
[![dependencies](https://david-dm.org/reducejs/reduce-js.svg)](https://david-dm.org/reducejs/reduce-js)
[![devDependencies](https://david-dm.org/reducejs/reduce-js/dev-status.svg)](https://david-dm.org/reducejs/reduce-js#info=devDependencies)
![node](https://img.shields.io/node/v/common-bundle.svg)

Augment [`browserify`] with the following features:

* Accept patterns to add entries.
* Use [`watchify2`] to watch files, which is able to detect new entries.
* Use [`common-bundle`] to pack modules by default,
  which make `b.bundle()` output a stream manipulatable by [`gulp`] plugins.
  It can be replaced with other plugins like [`factor-bundle`].

## Example
Check the [gulpfile.js](example/multiple-bundles/gulpfile.js)

```js
'use strict'

const reduce = require('reduce-js')
const gulp = require('gulp')
const path = require('path')
const del = require('del')
const browserify = require('browserify')

gulp.task('clean', function () {
  return del(path.join(__dirname, 'build'))
})

gulp.task('build', ['clean'], function () {
  let b = createBundler()
  return gulp.src('page/**/index.js', { cwd: b._options.basedir, read: false })
    .pipe(reduce.bundle(b, {
      groups: 'page/**/index.js',
      common: 'common.js',
    }))
    .pipe(gulp.dest('build'))
})

gulp.task('watch', ['clean'], function (cb) {
  let b = createBundler()
  b.on('bundle-stream', function (bundleStream) {
    // `bundleStream` is the result of `b.bundle()`
    bundleStream.pipe(gulp.dest('build'))
  })
  gulp.src('page/**/index.js', { cwd: b._options.basedir, read: false })
    .pipe(reduce.watch(b, {
      groups: 'page/**/index.js',
      common: 'common.js',
    }, { entryGlob: 'page/**/index.js' }))
})

function createBundler() {
  let basedir = path.join(__dirname, 'src')
  let b = browserify({
    basedir: basedir,
    paths: [path.join(basedir, 'web_modules')],
  })

  b.on('log', console.log.bind(console))
  b.on('error', console.log.bind(console))

  return b
}

```

## API

```javascript
const reduce = require('reduce-js')

```

### reduce.bundle(b, opts)
Return a transform:
* input: [`vinyl-fs#src`]
* output: `b.bundle()`

**b**

[`browserify`] instance.

**opts**

Options passed to `reduce.bundler`.


```javascript
'use strict'

const reduce = require('reduce-js')
const path = require('path')
const browserify = require('browserify')

const basedir = path.join(__dirname, 'src')
const b = browserify({ basedir: basedir })

reduce.src('*.js', { cwd: basedir })
  .pipe(reduce.bundle(b, {
    groups: '+(a|b).js',
    common: 'common.js',
  }))
  .pipe(reduce.dest('build'))

```

### reduce.watch(b, opts, watchOpts)
Return a transform:
* input: [`vinyl-fs#src`]
* output: actually no data flows out.
  The `pipe` method is overwritten to accept stream constructors rather than instances,
  which are used to construct the downstream pipeline for `b.bundle()`.
  (`pipe` is an alias for `lazypipe`, you could use the latter instead)

`b` and `opts` are the same with `reduce.bundle(b, opts)`

**watchOpts**

Options passed to [`watchify2`].


```javascript
'use strict'

const reduce = require('reduce-js')
const path = require('path')
const browserify = require('browserify')

const basedir = path.join(__dirname, 'src')
const b = browserify({ basedir: basedir })

b.on('bundle-stream', function (bundleStream) {
  // `bundleStream` is the result of `b.bundle()`
  bundleStream.pipe(reduce.dest('build'))
})
reduce.src('*.js', { cwd: basedir })
  .pipe(reduce.watch(b, {
    groups: '+(a|b|d).js',
    common: 'common.js',
  }, { entryGlob: '*.js' }))

```

### reduce.src(patterns, opts)
Same with [`vinyl-fs#src`], except that `opts.read` defaults to `false`.

### reduce.dest(outFolder, opts)
Same with [`vinyl-fs#dest`].

### reduce.bundler(b, opts)
The default plugin for packing modules.

**opts**

Default: `bundle.js`

* `Function` or `Array`: `b.plugin(opts)` will be executed. Used to replace the default bundler [`common-bundle`].
* `String`: all modules are packed into a single bundle, with `opts` the file path.
* otherwise: `opts` is passed to [`common-bundle`] directly.

```js
const reduce = require('reduce-js')
const path = require('path')
const browserify = require('browserify')

const b = browserify({
  entries: ['a.js', 'b.js'],
  basedir: '/path/to/src',
})
b.plugin(reduce.bundler, 'bundle.js')
b.bundle().pipe(reduce.dest('build'))

```

### reduce.watcher(b, opts)
The plugin for watching file changes, addition and deletion.

`opts` is passed to [`watchify2`] directly.

```js
const reduce = require('reduce-js')
const path = require('path')
const browserify = require('browserify')
const b = browserify({
  entries: ['a.css', 'b.css'],
  basedir: '/path/to/src',
})
b.plugin(reduce.bundler, 'bundle.js')
b.plugin(reduce.watcher, { entryGlob: '*.js' })
b.on('bundle-stream', function (bundleStream) {
  // bundleStream is the result of `b.bundle()`
  bundleStream.pipe(reduce.dest('build'))
})
b.start()

```

## Related

* [`reduce-css`]
* [`browserify`]


[`reduce-css`]: https://github.com/reducejs/reduce-css
[`browserify`]: https://www.npmjs.com/package/browserify
[`factor-bundle`]: https://www.npmjs.com/package/factor-bundle
[`common-bundle`]: https://www.npmjs.com/package/common-bundle
[`gulp`]: https://www.npmjs.com/package/gulp
[`watchify`]: https://github.com/substack/watchify
[`watchify2`]: https://github.com/reducejs/watchify2
[`vinyl-fs#src`]: https://github.com/gulpjs/vinyl-fs#srcglobs-options
[`vinyl-fs#dest`]: https://github.com/gulpjs/vinyl-fs#destfolder-options

