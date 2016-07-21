/*!
 * ND-PROMISE v3.0.2
 * (c) 2016 crossjs
 * Released under the MIT License.
 */
var ndpromise = (function () {
    'use strict';

    (function (global, undefined) {
        "use strict";

        if (global.setImmediate) {
            return;
        }

        var nextHandle = 1; // Spec says greater than zero
        var tasksByHandle = {};
        var currentlyRunningATask = false;
        var doc = global.document;
        var setImmediate;

        function addFromSetImmediateArguments(args) {
            tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
            return nextHandle++;
        }

        // This function accepts the same arguments as setImmediate, but
        // returns a function that requires no arguments.
        function partiallyApplied(handler) {
            var args = [].slice.call(arguments, 1);
            return function () {
                if (typeof handler === "function") {
                    handler.apply(undefined, args);
                } else {
                    new Function("" + handler)();
                }
            };
        }

        function runIfPresent(handle) {
            // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
            // So if we're currently running a task, we'll need to delay this invocation.
            if (currentlyRunningATask) {
                // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
                // "too much recursion" error.
                setTimeout(partiallyApplied(runIfPresent, handle), 0);
            } else {
                var task = tasksByHandle[handle];
                if (task) {
                    currentlyRunningATask = true;
                    try {
                        task();
                    } finally {
                        clearImmediate(handle);
                        currentlyRunningATask = false;
                    }
                }
            }
        }

        function clearImmediate(handle) {
            delete tasksByHandle[handle];
        }

        function installNextTickImplementation() {
            setImmediate = function setImmediate() {
                var handle = addFromSetImmediateArguments(arguments);
                process.nextTick(partiallyApplied(runIfPresent, handle));
                return handle;
            };
        }

        function canUsePostMessage() {
            // The test against `importScripts` prevents this implementation from being installed inside a web worker,
            // where `global.postMessage` means something completely different and can't be used for this purpose.
            if (global.postMessage && !global.importScripts) {
                var postMessageIsAsynchronous = true;
                var oldOnMessage = global.onmessage;
                global.onmessage = function () {
                    postMessageIsAsynchronous = false;
                };
                global.postMessage("", "*");
                global.onmessage = oldOnMessage;
                return postMessageIsAsynchronous;
            }
        }

        function installPostMessageImplementation() {
            // Installs an event handler on `global` for the `message` event: see
            // * https://developer.mozilla.org/en/DOM/window.postMessage
            // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

            var messagePrefix = "setImmediate$" + Math.random() + "$";
            var onGlobalMessage = function onGlobalMessage(event) {
                if (event.source === global && typeof event.data === "string" && event.data.indexOf(messagePrefix) === 0) {
                    runIfPresent(+event.data.slice(messagePrefix.length));
                }
            };

            if (global.addEventListener) {
                global.addEventListener("message", onGlobalMessage, false);
            } else {
                global.attachEvent("onmessage", onGlobalMessage);
            }

            setImmediate = function setImmediate() {
                var handle = addFromSetImmediateArguments(arguments);
                global.postMessage(messagePrefix + handle, "*");
                return handle;
            };
        }

        function installMessageChannelImplementation() {
            var channel = new MessageChannel();
            channel.port1.onmessage = function (event) {
                var handle = event.data;
                runIfPresent(handle);
            };

            setImmediate = function setImmediate() {
                var handle = addFromSetImmediateArguments(arguments);
                channel.port2.postMessage(handle);
                return handle;
            };
        }

        function installReadyStateChangeImplementation() {
            var html = doc.documentElement;
            setImmediate = function setImmediate() {
                var handle = addFromSetImmediateArguments(arguments);
                // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
                // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
                var script = doc.createElement("script");
                script.onreadystatechange = function () {
                    runIfPresent(handle);
                    script.onreadystatechange = null;
                    html.removeChild(script);
                    script = null;
                };
                html.appendChild(script);
                return handle;
            };
        }

        function installSetTimeoutImplementation() {
            setImmediate = function setImmediate() {
                var handle = addFromSetImmediateArguments(arguments);
                setTimeout(partiallyApplied(runIfPresent, handle), 0);
                return handle;
            };
        }

        // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
        var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
        attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

        // Don't get fooled by e.g. browserify environments.
        if ({}.toString.call(global.process) === "[object process]") {
            // For Node.js before 0.9
            installNextTickImplementation();
        } else if (canUsePostMessage()) {
            // For non-IE10 modern browsers
            installPostMessageImplementation();
        } else if (global.MessageChannel) {
            // For web workers, where supported
            installMessageChannelImplementation();
        } else if (doc && "onreadystatechange" in doc.createElement("script")) {
            // For IE 6–8
            installReadyStateChangeImplementation();
        } else {
            // For older browsers
            installSetTimeoutImplementation();
        }

        attachTo.setImmediate = setImmediate;
        attachTo.clearImmediate = clearImmediate;
    })(typeof self === "undefined" ? typeof global === "undefined" ? undefined : global : self);

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
    };

    function NP(fn) {
      var _this = this;

      if (_typeof(this) !== 'object') throw new TypeError('Promises must be constructed via new');
      if (typeof fn !== 'function') throw new TypeError('not a function');
      this._state = null;
      this._value = null;
      this._progress = null;
      this._deferreds = [];

      doResolve(fn, function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        resolve.apply(_this, args);
      }, function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        reject.apply(_this, args);
      }, function () {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        notify.apply(_this, args);
      });
    }

    function handle(deferred) {
      var _this2 = this;

      if (this._state === null) {
        this._deferreds.push(deferred);
        if (deferred.onProgress) {
          if (this._progress !== null) {
            setImmediate(function () {
              deferred.onProgress(_this2._progress);
            });
          }
        }
        return;
      }
      setImmediate(function () {
        var cb = _this2._state ? deferred.onFulfilled : deferred.onRejected;
        if (cb === null) {
          (_this2._state ? deferred.resolve : deferred.reject)(_this2._value);
          return;
        }
        var ret = void 0;
        try {
          ret = cb(_this2._value);
        } catch (e) {
          deferred.reject(e);
          return;
        }
        deferred.resolve(ret);
      });
    }

    function resolve(newValue) {
      var _this3 = this;

      try {
        // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
        if (newValue === this) {
          throw new TypeError('A promise cannot be resolved with itself.');
        }
        if (newValue && ((typeof newValue === 'undefined' ? 'undefined' : _typeof(newValue)) === 'object' || typeof newValue === 'function')) {
          var _ret = function () {
            var then = newValue.then;
            if (typeof then === 'function') {
              doResolve(function () {
                for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                  args[_key4] = arguments[_key4];
                }

                then.apply(newValue, args);
              }, function () {
                for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                  args[_key5] = arguments[_key5];
                }

                resolve.apply(_this3, args);
              }, function () {
                for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                  args[_key6] = arguments[_key6];
                }

                reject.apply(_this3, args);
              }, function () {
                for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
                  args[_key7] = arguments[_key7];
                }

                notify.apply(_this3, args);
              });
              return {
                v: void 0
              };
            }
          }();

          if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
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
      var _this4 = this;

      return new NP(function (resolve, reject, notify) {
        handle.call(_this4, new Handler(onFulfilled, onRejected, onProgress, resolve, reject, notify));
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

    return NP;

}());