# reduce-js
[![version](https://img.shields.io/npm/v/reduce-js.svg)](https://www.npmjs.org/package/reduce-js)
[![status](https://travis-ci.org/reducejs/reduce-js.svg?branch=master)](https://travis-ci.org/reducejs/reduce-js)
[![coverage](https://img.shields.io/coveralls/reducejs/reduce-js.svg)](https://coveralls.io/github/reducejs/reduce-js)
[![dependencies](https://david-dm.org/reducejs/reduce-js.svg)](https://david-dm.org/reducejs/reduce-js)
[![devDependencies](https://david-dm.org/reducejs/reduce-js/dev-status.svg)](https://david-dm.org/reducejs/reduce-js#info=devDependencies)
![node](https://img.shields.io/node/v/reduce-js.svg)

Augment [`browserify`] with the following features:

* Accept patterns to add entries.
* Use [`watchify2`] to watch files, which is able to detect new entries.
* Use [`common-bundle`] to pack modules by default,
  which make `b.bundle()` output a stream manipulatable by [`gulp`] plugins.

## Example
Suppose we want to create one bundle for each js file in `/path/to/src`,
and an additional common bundle to hold modules shared among them.

```js
const reduce = require('reduce-js')
const path = require('path')
const del = require('del')
const uglify = require('gulp-uglify')

bundle(createBundler())

function createBundler(watch) {
  var b = reduce.create(
    /* glob for entries */
    '*.js',

    /* options for browserify */
    {
      basedir: path.join(__dirname, 'src'),
      cache: {},
      packageCache: {},
    },

    /* options for common-bundle */
    // single bundle
    // 'bundle.js',
    // multiple bundles
    {
      groups: '*.js',
      common: 'common.js',
    },

    /* options for watchify2 */
    watch && { entryGlob: '*.js' }
  )
  return b
}

function bundle(b) {
  var build = path.join(__dirname, 'build')
  del.sync(build)
  return b.bundle().pipe(uglify()).pipe(b.dest(build))
}


```

To watch file changes:
```js
var b = createBundler(true)
b.on('update', function update() {
  bundle(b)
  return update
}())

```

To work with gulp:

```js
var gulp = require('gulp')
gulp.task('build', function () {
  return bundle(createBundler())
})

gulp.task('watch', function (cb) {
  var b = createBundler(true)
  b.on('update', function update() {
    bundle(b)
    return update
  }())
  b.on('close', cb)
})

```


## API

```javascript
var reduce = require('reduce-js')
var b = reduce.create(entries, browserifyOptions, bundleOptions, watchifyOptions)

```

### reduce.create(entries, browserifyOptions, bundleOptions, watchifyOptions)
Return a [`browserify`] instance.

* `entries`: patterns to locate input files. Check [`globby`] for more details.
* `browserifyOptions`: options for [`browserify`].
* `bundleOptions`: options for [`common-bundle`].
* `watchifyOptions`: options for [`watchify2`]. If truthy, file changes are watched.

### b.bundle()
Return a [`vinyl`] stream,
which can be processed by gulp plugins.

```js
b.bundle().pipe(require('gulp-uglify')()).pipe(b.dest('build'))

```
### b.dest(outFolder, options)
The same with [`gulp.dest`].

## Related

* [`browserify`]
* [`reduce-css`]


[`reduce-css`]: https://github.com/reducejs/reduce-css
[`browserify`]: https://www.npmjs.com/package/browserify
[`common-bundle`]: https://www.npmjs.com/package/common-bundle
[`gulp`]: https://www.npmjs.com/package/gulp
[`watchify`]: https://github.com/substack/watchify
[`watchify2`]: https://github.com/reducejs/watchify2
[`gulp.dest`]: https://github.com/gulpjs/vinyl-fs#destfolder-options

