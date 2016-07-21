<a href="http://promises-aplus.github.com/promises-spec"><img src="http://promises-aplus.github.com/promises-spec/assets/logo-small.png" align="right" alt="Promises/A+ logo" /></a>
# ND-PROMISE

> :two_hearts: Lightweight ES6 Promise polyfill for the browser and node. Adheres closely to the spec. It is a perfect polyfill IE, Firefox or any other browser that does not support native promises.

[![Travis](https://img.shields.io/travis/ndfront/nd-promise.svg?style=flat-square)](https://travis-ci.org/ndfront/nd-promise)
[![Coveralls](https://img.shields.io/coveralls/ndfront/nd-promise.svg?style=flat-square)](https://coveralls.io/github/ndfront/nd-promise)
[![dependencies](https://david-dm.org/ndfront/nd-promise.svg?style=flat-square)](https://david-dm.org/ndfront/nd-promise)
[![devDependency Status](https://david-dm.org/ndfront/nd-promise/dev-status.svg?style=flat-square)](https://david-dm.org/ndfront/nd-promise#info=devDependencies)
[![NPM version](https://img.shields.io/npm/v/nd-promise.svg?style=flat-square)](https://npmjs.org/package/nd-promise)

This implementation is based on [taylorhakes/promise-polyfill](https://github.com/taylorhakes/promise-polyfill) and [then/promise](https://github.com/then/promise). It has been changed to use the prototype for performance and memory reasons.

For API information about Promises, please check out this article [HTML5Rocks article](http://www.html5rocks.com/en/tutorials/es6/promises/).

## Browser Support

IE8+, Chrome, Firefox, IOS 4+, Safari 5+, Opera

## Change Log

### New in 3.0.3

Remove function bind; use rollup instead of webpack

### New in 3.0.2

IE8 compatibility

### New in 2.4.0

Rewrite core and test with ES6

### New in 2.3.0

``` js
new Promise(function(resolve, reject, notify) {
  // resolve, reject, notify
}).then(function(value) {
  // do something
}).catch(function(error) {
  // do something
}).progress(function(value) {
  // do something
}).finally(function() {
  // do something
})
```

### New in 2.2.0

``` js
new Promise(function(resolve, reject, notify) {
  notify(40)
  setTimeout(function() {
    notify(55)
  }, 50)
}).progress(function(value) {
  console.log(value)
})
```

## Usage

### cjs

``` bash
$ npm install nd-promise
```

### iife

- [nd-promise](index.js) [minified](index.min.js)

## Example

```js
const prom = new Promise(function(resolve, reject) {
  // do a thing, possibly async, then…

  if (/* everything turned out fine */) {
    resolve("Stuff worked!");
  }  else {
    reject(new Error("It broke"));
  }
});

// Do something when async done
prom.then(function() {
  ...
});
```

## Testing

``` bash
npm install
npm test
```

## License

MIT
