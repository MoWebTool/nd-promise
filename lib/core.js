'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

require('setimmediate');

function NP(fn) {
  if (_typeof(this) !== 'object') throw new TypeError('Promises must be constructed via new');
  if (typeof fn !== 'function') throw new TypeError('not a function');
  this._state = null;
  this._value = null;
  this._progress = null;
  this._deferreds = [];

  doResolve(fn, resolve.bind(this), reject.bind(this), notify.bind(this));
}

function handle(deferred) {
  var me = this;
  if (me._state === null) {
    me._deferreds.push(deferred);
    if (deferred.onProgress) {
      if (me._progress !== null) {
        setImmediate(function () {
          deferred.onProgress(me._progress);
        });
      }
    }
    return;
  }
  setImmediate(function () {
    var cb = me._state ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      (me._state ? deferred.resolve : deferred.reject)(me._value);
      return;
    }
    var ret = void 0;
    try {
      ret = cb(me._value);
    } catch (e) {
      deferred.reject(e);
      return;
    }
    deferred.resolve(ret);
  });
}

function resolve(newValue) {
  try {
    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    if (newValue === this) {
      throw new TypeError('A promise cannot be resolved with itself.');
    }
    if (newValue && ((typeof newValue === 'undefined' ? 'undefined' : _typeof(newValue)) === 'object' || typeof newValue === 'function')) {
      var then = newValue.then;
      if (typeof then === 'function') {
        doResolve(then.bind(newValue), resolve.bind(this), reject.bind(this), notify.bind(this));
        return;
      }
    }
    this._state = true;
    this._value = newValue;
    finale.call(this);
  } catch (e) {
    reject.call(this, e);
  }
}

function reject(newValue) {
  this._state = false;
  this._value = newValue;
  finale.call(this);
}

function notify(progress) {
  this._progress = progress;
  finale.call(this, true);
}

function finale(keep) {
  for (var i = 0, len = this._deferreds.length; i < len; i++) {
    handle.call(this, this._deferreds[i]);
  }
  if (!keep) {
    this._deferreds = null;
  }
}

function Handler(onFulfilled, onRejected, onProgress, resolve, reject, notify) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.onProgress = typeof onProgress === 'function' ? onProgress : null;
  this.resolve = resolve;
  this.reject = reject;
  this.notify = notify;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, onFulfilled, onRejected, onProgress) {
  var done = false;
  try {
    fn(function (value) {
      if (done) return;
      done = true;
      onFulfilled(value);
    }, function (reason) {
      if (done) return;
      done = true;
      onRejected(reason);
    }, function (progress) {
      if (done) return;
      onProgress(progress);
    });
  } catch (e) {
    if (done) return;
    done = true;
    onRejected(e);
  }
}

NP.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
};

NP.prototype['finally'] = function (done) {
  return this.then(function (value) {
    return NP.resolve(done()).then(function () {
      return value;
    });
  }, function (reason) {
    return NP.resolve(done()).then(function () {
      throw reason;
    });
  });
};

NP.prototype.progress = function (onProgress) {
  return this.then(null, null, onProgress);
};

NP.prototype.then = function (onFulfilled, onRejected, onProgress) {
  var me = this;
  return new NP(function (resolve, reject, notify) {
    handle.call(me, new Handler(onFulfilled, onRejected, onProgress, resolve, reject, notify));
  });
};

NP.resolve = function (value) {
  if (value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value.constructor === NP) {
    return value;
  }

  return new NP(function (resolve) {
    return resolve(value);
  });
};

NP.reject = function (value) {
  return new NP(function (resolve, reject) {
    return reject(value);
  });
};

NP.notify = function (value) {
  return new NP(function (resolve, reject, notify) {
    return notify(value);
  });
};

NP.all = function (values) {
  return new NP(function (resolve, reject, notify) {
    if (values.length === 0) return resolve([]);
    var remaining = values.length;

    function res(i, val) {
      try {
        if (val && ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' || typeof val === 'function')) {
          var then = val.then;
          if (typeof then === 'function') {
            then.call(val, function (val) {
              res(i, val);
            }, reject, notify);
            return;
          }
        }
        values[i] = val;
        if (--remaining === 0) {
          resolve(values);
        }
      } catch (e) {
        reject(e);
      }
    }
    for (var i = 0; i < values.length; i++) {
      res(i, values[i]);
    }
  });
};

NP.race = function (values) {
  return new NP(function (resolve, reject, notify) {
    for (var i = 0, len = values.length; i < len; i++) {
      NP.resolve(values[i]).then(resolve, reject, notify);
    }
  });
};

exports.default = NP;
module.exports = exports['default'];
