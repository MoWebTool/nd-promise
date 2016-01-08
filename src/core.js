import 'setimmediate'

// Use polyfill for setImmediate for performance gains
const asap = setImmediate

const isArray = Array.isArray || function (value) {
  return Object.prototype.toString.call(value) === '[object Array]'
}

function NPromise (fn) {
  if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new')
  if (typeof fn !== 'function') throw new TypeError('not a function')
  this._state = null
  this._value = null
  this._progress = null
  this._deferreds = []

  doResolve(fn, resolve.bind(this), reject.bind(this), notify.bind(this))
}

function handle (deferred) {
  const me = this
  if (this._state === null) {
    this._deferreds.push(deferred)
    if (deferred.onProgress) {
      if (me._progress !== null) {
        asap(() => {
          deferred.onProgress(me._progress)
        })
      }
    }
    return
  }
  asap(() => {
    const cb = me._state ? deferred.onFulfilled : deferred.onRejected
    if (cb === null) {
      (me._state ? deferred.resolve : deferred.reject)(me._value)
      return
    }
    let ret
    try {
      ret = cb(me._value)
    } catch (e) {
      deferred.reject(e)
      return
    }
    deferred.resolve(ret)
  })
}

function resolve (newValue) {
  try {
    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    if (newValue === this) {
      throw new TypeError('A promise cannot be resolved with itself.')
    }
    if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
      const then = newValue.then
      if (typeof then === 'function') {
        doResolve(then.bind(newValue), resolve.bind(this), reject.bind(this), notify.bind(this))
        return
      }
    }
    this._state = true
    this._value = newValue
    finale.call(this)
  } catch (e) {
    reject.call(this, e)
  }
}

function reject (newValue) {
  this._state = false
  this._value = newValue
  finale.call(this)
}

function notify (progress) {
  this._progress = progress
  finale.call(this, true)
}

function finale (keep) {
  for (let i = 0, len = this._deferreds.length; i < len; i++) {
    handle.call(this, this._deferreds[i])
  }
  if (!keep) {
    this._deferreds = null
  }
}

function Handler (onFulfilled, onRejected, onProgress, resolve, reject, notify) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null
  this.onProgress = typeof onProgress === 'function' ? onProgress : null
  this.resolve = resolve
  this.reject = reject
  this.notify = notify
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve (fn, onFulfilled, onRejected, onProgress) {
  let done = false
  try {
    fn(value => {
      if (done) return
      done = true
      onFulfilled(value)
    }, reason => {
      if (done) return
      done = true
      onRejected(reason)
    }, progress => {
      if (done) return
      onProgress(progress)
    })
  } catch (ex) {
    if (done) return
    done = true
    onRejected(ex)
  }
}

NPromise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected)
}

NPromise.prototype['finally'] = function (done) {
  return this.then(value => NPromise.resolve(done()).then(() => {
    return value
  }), reason => NPromise.resolve(done()).then(() => {
    throw reason
  }))
}

NPromise.prototype.progress = function (onProgress) {
  return this.then(null, null, onProgress)
}

NPromise.prototype.then = function (onFulfilled, onRejected, onProgress) {
  const me = this
  return new NPromise((resolve, reject, notify) => {
    handle.call(me, new Handler(onFulfilled, onRejected, onProgress, resolve, reject, notify))
  })
}

NPromise.all = () => {
  const args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments)

  return new NPromise((resolve, reject, notify) => {
    if (args.length === 0) return resolve([])
    let remaining = args.length

    function res (i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          const then = val.then
          if (typeof then === 'function') {
            then.call(val, val => {
              res(i, val)
            }, reject, notify)
            return
          }
        }
        args[i] = val
        if (--remaining === 0) {
          resolve(args)
        }
      } catch (ex) {
        reject(ex)
      }
    }
    for (let i = 0; i < args.length; i++) {
      res(i, args[i])
    }
  })
}

NPromise.resolve = value => {
  if (value && typeof value === 'object' && value.constructor === NPromise) {
    return value
  }

  return new NPromise(resolve => {
    resolve(value)
  })
}

NPromise.reject = value => new NPromise((resolve, reject) => {
  reject(value)
})

NPromise.notify = value => new NPromise((resolve, reject, notify) => {
  notify(value)
})

NPromise.race = values => new NPromise((resolve, reject, notify) => {
  for (let i = 0, len = values.length; i < len; i++) {
    NPromise.resolve(values[i]).then(resolve, reject, notify)
  }
})

export default NPromise
