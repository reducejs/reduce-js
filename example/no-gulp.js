var reduce = require('..');
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

