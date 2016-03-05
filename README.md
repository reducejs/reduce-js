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

Suppose we want to pack all modules in `/path/to/src` (not including those in its subdirectories) into `/path/to/build/bundle.js`.

There are alreay `a.js` and `b.js` in `/path/to/src`, and they both depend upon `/path/to/src/c/index.js`.

```js
'use strict'

const reduce = require('reduce-js')
const del = require('del')

const basedir = __dirname + '/src'
const build = __dirname + '/build'
del(build).then(function () {
  let b = reduce.create({ basedir: basedir })

  // { 'bundle.js': { modules: [ 'b.js', 'a.js', 'c/index.js'  ]  }  }
  b.on('common.map', map => console.log(map))

  reduce.src('*.js', { cwd: basedir })
    .pipe(reduce.bundle(b, 'bundle.js'))
    .pipe(reduce.dest(build))
})

```

To watch file changes, addition and deletion:

```js
'use strict'

const reduce = require('reduce-js')
const path = require('path')
const del = require('del')

const basedir = __dirname + '/src'
const build = __dirname + '/build'
del(build).then(function () {
  let b = reduce.create({
    basedir,
    cache: {},
    packageCache: {},
  })

  b.on('common.map', map => console.log(map))

  b.on('bundle-stream', function (bundleStream) {
    // `bundleStream` is the result of `b.bundle()`
    bundleStream.pipe(reduce.dest(build))
  })
  reduce.src('*.js', { cwd: basedir })
    // Now files added in `/path/to/src` will be detected and cause rebundling.
    .pipe(reduce.watch(b, 'bundle.js', { entryGlob: '*.js' }))
})

```

If you don't need the glob, you can always fall back to the default:

```js
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

  b.on('common.map', map => console.log(map))

  b.plugin(reduce.bundler, 'bundle.js')
  b.bundle().pipe(reduce.dest(build))
})


```

watch:

```js
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
    entries: ['a.js', 'b.js'],
  })

  b.on('common.map', map => console.log(map))

  b.plugin(reduce.bundler, 'bundle.js')
  b.plugin(reduce.watcher, { entryGlob: '*.js' })
  b.on('bundle-stream', function (bundleStream) {
    bundleStream.pipe(reduce.dest(build))
  })
  b.start()
})

```

## Work with Gulp
As [`common-bundle`] makes `b.bundle()` return a stream like `gulp.src`, it is quite easy to work with gulp plugins.

The following example shows how to create multiple bundles.

```js
'use strict'

const reduce = require('reduce-js')
const gulp = require('gulp')
const path = require('path')
const del = require('del')

gulp.task('clean', function () {
  return del(path.join(__dirname, 'build'))
})

gulp.task('build', ['clean'], function () {
  let b = createBundler()
  return reduce.src('page/**/index.js', { cwd: b._options.basedir })
    .pipe(reduce.bundle(b, {
      // This object is passed to `common-bundle`.
      groups: 'page/**/index.js',
      common: 'common.js',
    }))
    .pipe(reduce.dest('build'))
})

gulp.task('watch', ['clean'], function (cb) {
  let b = createBundler()

  let clean = require('clean-remains')([])

  b.on('bundle-stream', function (bundleStream) {
    bundleStream
      .pipe(reduce.dest('build'))
      // This plugin will remove files created in the building history but no longer in the newest build.
      .pipe(clean())
  })
  reduce.src('page/**/index.js', { cwd: b._options.basedir })
    .pipe(reduce.watch(b, {
      // This object is passed to `common-bundle`.
      groups: 'page/**/index.js',
      common: 'common.js',
    }, { entryGlob: 'page/**/index.js' }))
})

function createBundler() {
  let basedir = path.join(__dirname, 'src')
  let b = reduce.create({
    basedir: basedir,
    paths: [path.join(basedir, 'web_modules')],
    fileCache: {},
    cache: {},
    packageCache: {},
  })

  // As multiple bundles are created,
  // it is important to deal with duplicates carefully.
  // There are known issues caused in such cases.
  // See https://github.com/substack/factor-bundle/issues/51
  // This plugin will just disable the default dedupe transform.
  b.plugin('dedupify')
  b.on('dedupify.deduped', function (o) {
    console.warn('Duplicates of modules found!', o.file, o.dup)
  })

  b.on('common.map', function (map) {
    console.log('bundles:', '[ ' + Object.keys(map).join(', ') + ' ]')
  })

  return b
}

```

## API

```javascript
const reduce = require('reduce-js')

```

### reduce.create
The [`browserify`] constructor.

### reduce.bundle(b, opts)
Return a transform:
* input: [`vinyl-fs#src`]
* output: `b.bundle()`

**b**

[`browserify`] instance.

**opts**

Options passed to `reduce.bundler`.


### reduce.watch(b, opts, watchOpts)
Return a transform:
* input: [`vinyl-fs#src`]
* output: actually no data flows out.

`b` and `opts` are the same with `reduce.bundle(b, opts)`

**watchOpts**

Options passed to [`watchify2`].


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

### reduce.watcher(b, opts)
The plugin for watching file changes, addition and deletion.

`opts` is passed to [`watchify2`] directly.

A `bundle-stream` event will be triggered on `b` whenever `b.bundle()` is run,
and you can listen to it to process `b.bundle()`.

Run `b.start()` to start bundling for the first time.

## Related

* [`browserify`]
* [`reduce-css`]


[`reduce-css`]: https://github.com/reducejs/reduce-css
[`browserify`]: https://www.npmjs.com/package/browserify
[`factor-bundle`]: https://www.npmjs.com/package/factor-bundle
[`common-bundle`]: https://www.npmjs.com/package/common-bundle
[`gulp`]: https://www.npmjs.com/package/gulp
[`watchify`]: https://github.com/substack/watchify
[`watchify2`]: https://github.com/reducejs/watchify2
[`vinyl-fs#src`]: https://github.com/gulpjs/vinyl-fs#srcglobs-options
[`vinyl-fs#dest`]: https://github.com/gulpjs/vinyl-fs#destfolder-options

