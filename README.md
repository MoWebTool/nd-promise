<a href="http://promises-aplus.github.com/promises-spec">
    <img src="http://promises-aplus.github.com/promises-spec/assets/logo-small.png"
         align="right" alt="Promises/A+ logo" />
</a>
# Promise
[![travis][travis-image]][travis-url]
[![Coverage Status](coveralls-image)]()
[travis-image]: https://img.shields.io/travis/crossjs/nd-promise.svg?style=flat
[travis-url]: https://travis-ci.org/crossjs/nd-promise
[coveralls-image]: https://coveralls.io/repos/crossjs/nd-promise/badge.svg?branch=master&service=github
[coveralls-url]: https://coveralls.io/github/crossjs/nd-promise?branch=master


Lightweight ES6 Promise polyfill for the browser and node. Adheres closely to the spec. It is a perfect polyfill IE, Firefox or any other browser that does not support native promises.

This implementation is based on [taylorhakes/promise-polyfill](https://github.com/taylorhakes/promise-polyfill) and [then/promise](https://github.com/then/promise). It has been changed to use the prototype for performance and memory reasons.

For API information about Promises, please check out this article [HTML5Rocks article](http://www.html5rocks.com/en/tutorials/es6/promises/).

It is extremely lightweight. ***< 1kb Gzipped***

## New in 2.3.0
```js
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

## New in 2.2.0
```js
new Promise(function(resolve, reject, notify) {
  notify(40)
  setTimeout(function() {
    notify(55)
  }, 50)
}).progress(function(value) {
  console.log(value)
})
```

## Browser Support
IE8+, Chrome, Firefox, IOS 4+, Safari 5+, Opera

## Downloads

- [nd-promise](index.js)

### Node
```bash
$ npm install nd-promise
```

## Simple use
```js
var prom = new Promise(function(resolve, reject) {
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
```bash
npm install
npm test
```

## License
MIT
