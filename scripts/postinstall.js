/*
var browserify = require('browserify');
var coffeeify  = require('coffeeify');

var bundler = browserify();
bundler.transform(coffeeify);
bundler.transform('jadeify');
bundler.transform('cssify');

bundler.add(__dirname + '/../node_modules/simple-modal/index.js');
bundler.bundle().pipe(process.stdout);
//*/

var browserify = require('browserify');
var coffeeify  = require('coffeeify');
var fs = require('fs');
var path = require('path');

browserify()
  .add(path.resolve(__dirname, '..', 'node_modules', 'simple-modal', 'index.js'))
  .bundle()
  //.transform({extensions: '.coffee'}, coffeeify)
  //.pipe(process.stdout);
  .pipe(fs.createWriteStream(path.resolve(__dirname, '..', 'simple-modal-bundle.js')));
