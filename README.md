# reduce-js
Use [browserify](https://www.npmjs.com/package/browserify)
and [factor-bundle](https://www.npmjs.com/package/factor-bundle)
to pack node-style modules into a single bundle or multiple bundles.

It generates a [vinyl](https://www.npmjs.com/package/vinyl) stream,
so very easy to be used with [gulp](https://www.npmjs.com/package/gulp),
which has a lot of plugins to transform such streams.

It also handles some subtle problems arisen when using factor-bundle.

# Table of contents

- [Examples](#examples)
  - [Single bundle](#single-bundle)

# Examples

## Single bundle

```javascript
gulp.task('default', ['clean'], function () {
  return reduce.src('*.js', { basedir: basedir })
    .on('log', gutil.log.bind(gutil))
    .on('error', onerror)
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('build'));
});
```

## Watch single bundle

```javascript
gulp.task('watch', ['clean'], function (cb) {
  reduce.watch()
    .on('log', gutil.log.bind(gutil))
    .on('error', onerror)
    .src('*.js', { basedir: basedir })
    .pipe(buffer)
    .pipe(uglify)
    .pipe(gulp.dest, 'build');
});
```

## Multiple bundles

```javascript
var factorOpts = {
  outputs: ['a.js', 'b.js'],
  common: 'common.js',
};
gulp.task('factor', ['clean'], function () {
  return reduce.src('*.js', { basedir: basedir, factor: factorOpts })
    .on('log', gutil.log.bind(gutil))
    .on('error', onerror)
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('build'));
});
```

## Watch multiple bundles

```javascript
var factorOpts = {
  outputs: ['a.js', 'b.js'],
  common: 'common.js',
};
gulp.task('factor.watch', ['clean'], function (cb) {
  reduce.watch()
    .on('log', gutil.log.bind(gutil))
    .on('error', onerror)
    .src('*.js', { basedir: basedir, factor: factorOpts })
    .pipe(buffer)
    .pipe(uglify)
    .pipe(gulp.dest, 'build');
});
```

# API

## reduce.src(patterns, bopts)

Creates a vinyl file stream,
which flows all the file objects,
and can be transformed by gulp plugins.

### patterns

Type: `String`, `Array`

Used by [xglob](https://github.com/zoubin/xglob) to find entries.

### bopts

Options to create the browserify instance.

Fields not explained in the following sections are the same with those in [browserify](https://github.com/substack/node-browserify#browserifyfiles--opts)

#### basedir

Also used as the `cwd` field of the options passed to xglob.

#### factor

Type: `Object`

Options passed to [factor-bundle](https://github.com/substack/factor-bundle/).

Fields not explained in the following sections are the same with those in [factor-bundle](https://github.com/substack/factor-bundle/#var-fr--factorfiles-opts)

##### common

Type: `String`

File name of the common bundle.

## w = reduce.watch(watchifyOpts)

Creates a watch instance.

`watchifyOpts` will be passed to `watchify`.

### w.src(pattern, opts)

The same with `reduce.src`.

### w.pipe(fn, arg1, arg2,...)

Like [lazypipe](https://github.com/OverZealous/lazypipe),
just pass the stream constructor and its arguments to `.pipe`,
and they will be called sequently with these arguments
to create the pipeline.


## reduce.dest

The same with [gulp.dest](https://github.com/gulpjs/gulp/blob/master/docs/API.md#gulpdestpath-options)

## reduce.lazypipe

The same with [lazypipe](https://github.com/OverZealous/lazypipe)

## reduce.run

The same with [callback-sequence#run](https://github.com/zoubin/callback-sequence#sequenceruncallbacks-done)

# factor-bundle

Options for controlling the behaviour of packing (`factorOpts`)
are specified as the `factor` field of the options object (`bopts`) passed to `.src`.

## Entries

There are two types of entires: browserify entries and factor entries.

### Browserify entries

Handled by browserify to generate all the text streams.

Specify browserify entries as the first argument passed to `.src`,
which can be patterns used by [xglob](https://github.com/zoubin/xglob).

Entry modules will be executed immediately when their containing outputs are loaded by the browser.

### Factor entries

Handled by factor-bundle to group the text streams generarted by browserify,
and create one bundle for each group.

Factor entries can be specified through `factorOpts.entries`.

They can be paths, either absolute or relative to `bopts.basedir`.

If `factorOpts.entries` is not defined, browserify entries will be used instead.
In that case, each entry located by `reduce.src` corresponds to a final bundle.

To avoid unexpected execution of browserify entries,
they are excluded from the common bundle by default.
If you want to pack some browserify entries into the common bundle,
such as modules for initiating all the site pages,
you can specify `factorOpts.entries` and excluded them from it.

## Outputs

Each factor entry groups several modules together and create a text stream,
which will be transformed into a vinyl stream.

You can specify the relative path (to the destination `gulp.dest()`) for each vinyl stream,
through `factorOpts.outputs`.

### The common vinyl stream

The common vinyl stream is constructed from the text stream generated from the pipeline of browserify.

You can specify its destination path through `factorOpts.common`.

If `factorOpts.common` is not defined,
and there are no other vinyl streams generated by factor-bundle,
`factorOpts.common` will be defaulted to `common.js`.
Otherwise, no common streams will be outputed.

#### Entries in common

Factor entries are always excluded from the common bundle.

Browserify entries that are not specified as factor entries will be included in the common bundle.

### Factor vinyl streams

Factor vinyl streams are created by factor-bundle.

You can specify their destination paths through `factorOpts.outputs`,
which should pair with `factorOpts.entries`.

# Dedupe

Modules could have the exactly same contents,
and thus some of them will be deduped.

However,
if deduped modules are not packed into the same bundle with the module deduped against,
those deduped ones will error when being executed.
See [factor-bundle#51](https://github.com/substack/factor-bundle/issues/51).

So, all non-entry deduped modules will be packed into the common bundle.

Entries will never be deduped.

## Hash IDs

Browserify uses numeric ids by default.

However, this id sequence is prone to volatile.
Adding a new module or deleting one probably will change the id of a lot of modules,
and thus you will see some bundles only have ids changed after building.

See [index-hashify](https://github.com/zoubin/index-hashify) for more details.

Yet,
if we use hashes,
deduped modules will have the same ids,
and discarded by factor-bundle.

Right now,
nothing has been done to make things better.

# Watchify

`reduce.src` generates a vinyl stream,
which could be transformed by gulp-plugins.

However, `reduce.watch().src` generates a [lazypipe](https://github.com/OverZealous/lazypipe) instance,
and will bundle in the next tick.

In normal mode,
you just `pipe` streams.

```javascript
var factorOpts = {
  outputs: ['a.js', 'b.js'],
  common: 'common.js',
};
gulp.task('factor', ['clean'], function () {
  return reduce.src('*.js', { basedir: basedir, factor: factorOpts })
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('build'));
});
```

In watch mode,
you should `pipe` stream constructors.

```javascript
var factorOpts = {
  outputs: ['a.js', 'b.js'],
  common: 'common.js',
};
gulp.task('factor.watch', ['clean'], function (cb) {
  reduce.watch()
    .src('*.js', { basedir: basedir, factor: factorOpts })
    .pipe(buffer)
    .pipe(uglify)
    .pipe(gulp.dest, 'build');
});
```

You can use `lazypipe` to make things clear:

```javascript
var reduce = require('reduce-js');
var lazypipe = reduce.lazypipe()
  .pipe(buffer)
  .pipe(uglify)
  .pipe(gulp.dest, 'build');

var factorOpts = {
  outputs: ['a.js', 'b.js'],
  common: 'common.js',
};
gulp.task('factor', ['clean'], function () {
  return reduce.src('*.js', { basedir: basedir, factor: factorOpts })
    .pipe(lazypipe());
});
gulp.task('factor.watch', ['clean'], function (cb) {
  reduce.watch()
    .src('*.js', { basedir: basedir, factor: factorOpts })
    .pipe(lazypipe);
});
```

# No gulp

Actually, `gulp` is not necessary.
`reduce.dest` can be always used in place of `gulp.dest`.
Use `reduce.run` to run the task.

```javascript
var reduce = require('reduce-js');
var path = require('path');

var basedir = path.join(__dirname, 'src');
var factorOpts = {
  outputs: ['a.js', 'b.js'],
  common: 'common.js',
};

var del = require('del');

reduce.run(
  [clean, bundle],
  function () {
    console.log('DONE');
  }
);

function clean() {
  return del(path.join(__dirname, 'build'));
}

function bundle() {
  return reduce
    .on('log', console.log.bind(console))
    .on('error', console.log.bind(console))
    .src('*.js', { basedir: basedir, factor: factorOpts })
    .pipe(reduce.dest('build'));
}

```

