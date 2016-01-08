!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.ndpromise=e():t.ndpromise=e()}(this,function(){return function(t){function e(o){if(n[o])return n[o].exports;var r=n[o]={exports:{},id:o,loaded:!1};return t[o].call(r.exports,r,r.exports,e),r.loaded=!0,r.exports}var n={};return e.m=t,e.c=n,e.p="",e(0)}([function(t,e,n){(function(o){"use strict";function r(t){if("object"!==p(this))throw new TypeError("Promises must be constructed via new");if("function"!=typeof t)throw new TypeError("not a function");this._state=null,this._value=null,this._progress=null,this._deferreds=[],l(t,u.bind(this),c.bind(this),s.bind(this))}function i(t){var e=this;return null===this._state?(this._deferreds.push(t),void(t.onProgress&&null!==e._progress&&h(function(){t.onProgress(e._progress)}))):void h(function(){var n=e._state?t.onFulfilled:t.onRejected;if(null===n)return void(e._state?t.resolve:t.reject)(e._value);var o=void 0;try{o=n(e._value)}catch(r){return void t.reject(r)}t.resolve(o)})}function u(t){try{if(t===this)throw new TypeError("A promise cannot be resolved with itself.");if(t&&("object"===("undefined"==typeof t?"undefined":p(t))||"function"==typeof t)){var e=t.then;if("function"==typeof e)return void l(e.bind(t),u.bind(this),c.bind(this),s.bind(this))}this._state=!0,this._value=t,f.call(this)}catch(n){c.call(this,n)}}function c(t){this._state=!1,this._value=t,f.call(this)}function s(t){this._progress=t,f.call(this,!0)}function f(t){for(var e=0,n=this._deferreds.length;n>e;e++)i.call(this,this._deferreds[e]);t||(this._deferreds=null)}function a(t,e,n,o,r,i){this.onFulfilled="function"==typeof t?t:null,this.onRejected="function"==typeof e?e:null,this.onProgress="function"==typeof n?n:null,this.resolve=o,this.reject=r,this.notify=i}function l(t,e,n,o){var r=!1;try{t(function(t){r||(r=!0,e(t))},function(t){r||(r=!0,n(t))},function(t){r||o(t)})}catch(i){if(r)return;r=!0,n(i)}}var d=arguments,p="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol?"symbol":typeof t};Object.defineProperty(e,"__esModule",{value:!0}),n(3);var h=o,m=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)};r.prototype["catch"]=function(t){return this.then(null,t)},r.prototype["finally"]=function(t){return this.then(function(e){return r.resolve(t()).then(function(){return e})},function(e){return r.resolve(t()).then(function(){throw e})})},r.prototype.progress=function(t){return this.then(null,null,t)},r.prototype.then=function(t,e,n){var o=this;return new r(function(r,u,c){i.call(o,new a(t,e,n,r,u,c))})},r.all=function(){var t=Array.prototype.slice.call(1===d.length&&m(d[0])?d[0]:d);return new r(function(e,n,o){function r(u,c){try{if(c&&("object"===("undefined"==typeof c?"undefined":p(c))||"function"==typeof c)){var s=c.then;if("function"==typeof s)return void s.call(c,function(t){r(u,t)},n,o)}t[u]=c,0===--i&&e(t)}catch(f){n(f)}}if(0===t.length)return e([]);for(var i=t.length,u=0;u<t.length;u++)r(u,t[u])})},r.resolve=function(t){return t&&"object"===("undefined"==typeof t?"undefined":p(t))&&t.constructor===r?t:new r(function(e){e(t)})},r.reject=function(t){return new r(function(e,n){n(t)})},r.notify=function(t){return new r(function(e,n,o){o(t)})},r.race=function(t){return new r(function(e,n,o){for(var i=0,u=t.length;u>i;i++)r.resolve(t[i]).then(e,n,o)})},e["default"]=r,t.exports=e["default"]}).call(e,n(1).setImmediate)},function(t,e,n){(function(t,o){function r(t,e){this._id=t,this._clearFn=e}var i=n(2).nextTick,u=Function.prototype.apply,c=Array.prototype.slice,s={},f=0;e.setTimeout=function(){return new r(u.call(setTimeout,window,arguments),clearTimeout)},e.setInterval=function(){return new r(u.call(setInterval,window,arguments),clearInterval)},e.clearTimeout=e.clearInterval=function(t){t.close()},r.prototype.unref=r.prototype.ref=function(){},r.prototype.close=function(){this._clearFn.call(window,this._id)},e.enroll=function(t,e){clearTimeout(t._idleTimeoutId),t._idleTimeout=e},e.unenroll=function(t){clearTimeout(t._idleTimeoutId),t._idleTimeout=-1},e._unrefActive=e.active=function(t){clearTimeout(t._idleTimeoutId);var e=t._idleTimeout;e>=0&&(t._idleTimeoutId=setTimeout(function(){t._onTimeout&&t._onTimeout()},e))},e.setImmediate="function"==typeof t?t:function(t){var n=f++,o=arguments.length<2?!1:c.call(arguments,1);return s[n]=!0,i(function(){s[n]&&(o?t.apply(null,o):t.call(null),e.clearImmediate(n))}),n},e.clearImmediate="function"==typeof o?o:function(t){delete s[t]}}).call(e,n(1).setImmediate,n(1).clearImmediate)},function(t,e){function n(){f=!1,u.length?s=u.concat(s):a=-1,s.length&&o()}function o(){if(!f){var t=setTimeout(n);f=!0;for(var e=s.length;e;){for(u=s,s=[];++a<e;)u&&u[a].run();a=-1,e=s.length}u=null,f=!1,clearTimeout(t)}}function r(t,e){this.fun=t,this.array=e}function i(){}var u,c=t.exports={},s=[],f=!1,a=-1;c.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)e[n-1]=arguments[n];s.push(new r(t,e)),1!==s.length||f||setTimeout(o,0)},r.prototype.run=function(){this.fun.apply(null,this.array)},c.title="browser",c.browser=!0,c.env={},c.argv=[],c.version="",c.versions={},c.on=i,c.addListener=i,c.once=i,c.off=i,c.removeListener=i,c.removeAllListeners=i,c.emit=i,c.binding=function(t){throw new Error("process.binding is not supported")},c.cwd=function(){return"/"},c.chdir=function(t){throw new Error("process.chdir is not supported")},c.umask=function(){return 0}},function(t,e,n){(function(t,e,n){!function(t,e){"use strict";function o(t){return m[h]=r.apply(e,t),h++}function r(t){var n=[].slice.call(arguments,1);return function(){"function"==typeof t?t.apply(e,n):new Function(""+t)()}}function i(t){if(y)setTimeout(r(i,t),0);else{var e=m[t];if(e){y=!0;try{e()}finally{u(t),y=!1}}}}function u(t){delete m[t]}function c(){p=function(){var t=o(arguments);return n.nextTick(r(i,t)),t}}function s(){if(t.postMessage&&!t.importScripts){var e=!0,n=t.onmessage;return t.onmessage=function(){e=!1},t.postMessage("","*"),t.onmessage=n,e}}function f(){var e="setImmediate$"+Math.random()+"$",n=function(n){n.source===t&&"string"==typeof n.data&&0===n.data.indexOf(e)&&i(+n.data.slice(e.length))};t.addEventListener?t.addEventListener("message",n,!1):t.attachEvent("onmessage",n),p=function(){var n=o(arguments);return t.postMessage(e+n,"*"),n}}function a(){var t=new MessageChannel;t.port1.onmessage=function(t){var e=t.data;i(e)},p=function(){var e=o(arguments);return t.port2.postMessage(e),e}}function l(){var t=v.documentElement;p=function(){var e=o(arguments),n=v.createElement("script");return n.onreadystatechange=function(){i(e),n.onreadystatechange=null,t.removeChild(n),n=null},t.appendChild(n),e}}function d(){p=function(){var t=o(arguments);return setTimeout(r(i,t),0),t}}if(!t.setImmediate){var p,h=1,m={},y=!1,v=t.document,g=Object.getPrototypeOf&&Object.getPrototypeOf(t);g=g&&g.setTimeout?g:t,"[object process]"==={}.toString.call(t.process)?c():s()?f():t.MessageChannel?a():v&&"onreadystatechange"in v.createElement("script")?l():d(),g.setImmediate=p,g.clearImmediate=u}}("undefined"==typeof self?"undefined"==typeof t?this:t:self)}).call(e,function(){return this}(),n(1).clearImmediate,n(2))}])});