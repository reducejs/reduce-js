'use strict'

const reduce = require('..')
const test = require('tap').test
const vm = require('vm')
const mkdirp = require('mkdirp')
const path = require('path')
const fs = require('fs')

const os = require('os')
const tmpdir = path.join((os.tmpdir || os.tmpDir)(), 'reduce-' + Math.random())
const src = path.resolve.bind(path, tmpdir, 'src')
const dest = path.resolve.bind(path, tmpdir, 'build')
const pool = {}

mkdirp.sync(tmpdir)
mkdirp.sync(src())
mkdirp.sync(dest())
write(src('c.js'), 1)

const entries = [src('a.js'), src('b.js')]
entries.forEach(function (file, i) {
  write(file, i)
})

test('watch', function(t) {
  let count = 4

  let basedir = src()
  let b = reduce.create(
    ['a.js', 'b.js'],
    {
      basedir,
      cache: {},
      packageCache: {},
    },
    {
      common: 'c.js',
      groups: '+(a|b).js',
    },
    true
  )
  b.once('close', function () {
    t.equal(count, 0)
    t.end()
  })
  b.on('update', function update() {
    b.bundle().pipe(b.dest(dest()))
      .once('end', () => setTimeout(next, 50))
    return update
  }())

  function next() {
    let c = readDest('c.js')
    t.equal(
      run(c + readDest('a.js')),
      pool.a + pool.c
    )
    t.equal(
      run(c + readDest('b.js')),
      pool.b + pool.c
    )
    if (!--count) {
      return b.close()
    }
    let file = [src('c.js')].concat(entries)[count % 3]
    let k = path.basename(file, '.js')
    let n = Math.floor(Math.random() * 10) + 1 + pool[k]
    write(file, n)
  }

})

function run (s) {
  let output = 0
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
  let base = path.basename(file, '.js')
  pool[base] = n
  let content = (base === 'c' ? '' : 'require("./c.js");') + 'console.log(' + n + ')' + '// ' + file
  fs.writeFileSync(file, content)
}

function readDest(file) {
  return fs.readFileSync(dest(file), 'utf8')
}

