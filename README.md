# reducify
Sugar way to use browserify

## Example

### Single bundle
`.src` works like `gulp.src`.

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

### Watch single bundle

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

### Multiple bundles

```javascript
var factorOpts = {
  outputs: ['a.js', 'b.js'],
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

### Watch multiple bundles

```javascript
var factorOpts = {
  outputs: ['a.js', 'b.js'],
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

## API

### reduce.src(patterns, opts)

Creates a vinyl file stream,
which flows all the file objects,
and can be transformed by gulp plugins.

#### patterns

Type: `String`, `Array`

Used by [xglob](https://github.com/zoubin/xglob) to find entries.

#### opts

Options to create the browserify instance.

New fields or fields with extra meanings are explained below.

##### basedir

Also used as the `cwd` field of the options passed to xglob.

##### require

Entries packed into the common bundle.

##### factor

Type: `Object`

Options passed to [post-factor-bundle](https://github.com/zoubin/post-factor-bundle).

(Perhaps move to `post-factor-bundle`?)

New fields or fields with extra meanings are explained below.

`common`

Type: `String`

File name of the common bundle

`commonFilter`

Type: `String`, `Array`, `Function`

If `String` or `Array`,
specified files will be packed into the common bundle.

If `Function`,
it receives the tested filename,
and if it returns true,
that file will be packed into the common bundle.

### w = reduce.watch(watchifyOpts)

Creates a watch instance.

`watchifyOpts` will be passed to `watchify`.

#### w.src(pattern, opts)

The same with `reduce.src`.

#### w.pipe(fn, arg1, arg2,...)

`.pipe` works like [lazypipe](https://github.com/OverZealous/lazypipe).

