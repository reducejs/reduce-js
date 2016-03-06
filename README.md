# reduce-js
[![version](https://img.shields.io/npm/v/reduce-js.svg)](https://www.npmjs.org/package/reduce-js)
[![status](https://travis-ci.org/reducejs/reduce-js.svg?branch=master)](https://travis-ci.org/reducejs/reduce-js)
[![coverage](https://img.shields.io/coveralls/reducejs/reduce-js.svg)](https://coveralls.io/github/reducejs/reduce-js)
[![dependencies](https://david-dm.org/reducejs/reduce-js.svg)](https://david-dm.org/reducejs/reduce-js)
[![devDependencies](https://david-dm.org/reducejs/reduce-js/dev-status.svg)](https://david-dm.org/reducejs/reduce-js#info=devDependencies)
![node](https://img.shields.io/node/v/common-bundle.svg)

Augment [`browserify`] with the following features:

* Accept patterns to add entries.
* Use [`watchify2`] to watch files, which is able to detect new entries.
* Use [`common-bundle`] to pack modules by default,
  which make `b.bundle()` output a stream manipulatable by [`gulp`] plugins.

## Example

Suppose we want to pack all modules in `/path/to/src` (not including those in its subdirectories) into `/path/to/build/bundle.js`.

There are already `a.js` and `b.js` in `/path/to/src`, and they both depend upon `/path/to/src/c/index.js`.

```js
'use strict'

const reduce = require('reduce-js')

const basedir = __dirname + '/src'
const build = __dirname + '/build'
const b = reduce.create({ basedir: basedir })

reduce.src('*.js', { cwd: basedir })
  .pipe(reduce.bundle(b, 'bundle.js'))
  .pipe(reduce.dest(build))
  .on('data', file => console.log('bundle:', file.relative))
  .on('end', () => console.log('DONE'))

```

To watch file changes, addition and deletion:

```js
'use strict'

const reduce = require('reduce-js')

const basedir = __dirname + '/src'
const build = __dirname + '/build'
const b = reduce.create({
  basedir,
  cache: {},
  packageCache: {},
})

reduce.src('*.js', { cwd: basedir })
  // Now files added in `/path/to/src` will be detected and cause rebundling.
  .pipe(reduce.watch(b, 'bundle.js', { entryGlob: '*.js' }))
  .on('bundle', function (bundleStream) {
    // `bundleStream` is the result of `b.bundle()`
    bundleStream.pipe(reduce.dest(build))
    .on('data', file => console.log('bundle:', file.relative))
    .on('end', () => console.log('-'.repeat(40)))
  })

```

If you don't need the glob, you can always fall back to the default:

```js
'use strict'

const reduce = require('reduce-js')

const basedir = __dirname + '/src'
const build = __dirname + '/build'
const b = reduce.create({
  basedir: basedir,
  entries: ['a.js', 'b.js'],
})

b.plugin(reduce.bundler, 'bundle.js')
b.bundle().pipe(reduce.dest(build))
.on('data', file => console.log('bundle:', file.relative))
.on('end', () => console.log('DONE'))


```

watch:

```js
'use strict'

const reduce = require('reduce-js')

const basedir = __dirname + '/src'
const build = __dirname + '/build'
const b = reduce.create({
  basedir,
  cache: {},
  packageCache: {},
  entries: ['a.js', 'b.js'],
})

b.plugin(reduce.bundler, 'bundle.js')
b.plugin(reduce.watcher, { entryGlob: '*.js' })
b.on('bundle-stream', function (bundleStream) {
  bundleStream.pipe(reduce.dest(build))
  .on('data', file => console.log('bundle:', file.relative))
  .on('end', () => console.log('-'.repeat(40)))
})
b.start()

```

## Work with Gulp
Check the [gulpfile](example/gulp/multi/gulpfile.js)
to see how to create common shared bundles with [`gulp`].

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
* output: actually no data flows out,
  but you can listen to the `bundle` event (triggered on the returned transform)
  to process the result of `b.bundle()`.

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

```js
'use strict'

const reduce = require('reduce-js')

const basedir = __dirname + '/src'
const build = __dirname + '/build'
const b = reduce.create({
  basedir: basedir,
  entries: ['a.js', 'b.js'],
})

b.plugin(reduce.bundler, 'bundle.js')
b.bundle().pipe(reduce.dest(build))

```

### reduce.watcher(b, opts)
The plugin for watching file changes, addition and deletion.

`opts` is passed to [`watchify2`] directly.

A `bundle-stream` event will be triggered on `b` whenever `b.bundle()` is run,
and you can listen to it to process `b.bundle()`.

Run `b.start()` to start bundling for the first time.

```js
'use strict'

const reduce = require('reduce-js')

const basedir = __dirname + '/src'
const build = __dirname + '/build'
const b = reduce.create({
  basedir,
  cache: {},
  packageCache: {},
  entries: ['a.js', 'b.js'],
})

b.plugin(reduce.bundler, 'bundle.js')
b.plugin(reduce.watcher, { entryGlob: '*.js' })
b.on('bundle-stream', function (bundleStream) {
  bundleStream.pipe(reduce.dest(build))
})
b.start()

```

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

