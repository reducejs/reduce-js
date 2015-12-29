var reduce = require('..')
var test = require('tap').test

var vm = require('vm')
var mkdirp = require('mkdirp')
var path = require('path')
var fs = require('fs')

var os = require('os')
var tmpdir = path.join((os.tmpdir || os.tmpDir)(), 'reduce-' + Math.random())
var src = path.resolve.bind(path, tmpdir, 'src')
var dest = path.resolve.bind(path, tmpdir, 'build')
var gulp = require('gulp')

var pool = {}

mkdirp.sync(tmpdir)
mkdirp.sync(src())
mkdirp.sync(dest())
write(src('c.js'), 1)

var entries = [src('a.js'), src('b.js')]
entries.forEach(function (file, i) {
  write(file, i)
})

test('watch', function(t) {
  var changeNum = 3
  t.plan((changeNum + 1) * 2)
  var bundleOptions = {
    common: 'c.js',
    groups: '**/+(a|b).js',
  }
  reduce.watch()
    .on('error', console.log.bind(console))
    .on('done', next)
    .src(['a.js', 'b.js'], {
      basedir: src(),
      bundleOptions: bundleOptions,
    })
    .pipe(gulp.dest, dest())

  function next() {
    var c = readDest('c.js')
    t.equal(
      run(c + readDest('a.js')),
      pool.a + pool.c
    )
    t.equal(
      run(c + readDest('b.js')),
      pool.b + pool.c
    )
    setTimeout(change.bind(this), 50)
  }

  function change() {
    if (!changeNum--) {
      return this.close()
    }
    var file = [src('c.js')].concat(entries)[changeNum % 3]
    var k = path.basename(file, '.js')
    var n = Math.floor(Math.random() * 10) + 1 + pool[k]
    write(file, n)
  }

})

function run (s) {
  var output = 0
  vm.runInNewContext(s, {
    console: {
      log: function (msg) {
        output += +msg
      },
    },
  })
  return output
}

function write(file, n) {
  var base = path.basename(file, '.js')
  pool[base] = n
  var content = (base === 'c' ? '' : 'require("./c.js");') + 'console.log(' + n + ')' + '// ' + file
  fs.writeFileSync(file, content)
}

function readDest(file) {
  return fs.readFileSync(dest(file), 'utf8')
}

