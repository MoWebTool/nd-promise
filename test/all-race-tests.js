var assert = require('better-assert')
var Promise = require('../src/core')

var a = { id: 'a'}
var b = { id: 'b'}
var c = { id: 'c'}

var A = Promise.resolve(a)
var B = Promise.resolve(b)
var C = Promise.resolve(c)

var rejection = { id: 'rejection'}
var rejected = new Promise(function (resolve, reject) { reject(rejection) })

describe('Promise.all(...)', function () {
  describe('an array', function () {
    describe('that is empty', function () {
      it('returns a promise for an empty array', function (done) {
        var res = Promise.all([])
        assert(res instanceof Promise)
        res.then(function (res) {
          assert(Array.isArray(res))
          assert(res.length === 0)
        })
        .finally(done)
      })
    })
    describe('of objects', function () {
      it('returns a promise for the array', function (done) {
        var res = Promise.all([a, b, c])
        assert(res instanceof Promise)
        res.then(function (res) {
          assert(Array.isArray(res))
          assert(res[0] === a)
          assert(res[1] === b)
          assert(res[2] === c)
        })
        .finally(done)
      })
    })
    describe('of promises', function () {
      it('returns a promise for an array containing the fulfilled values', function (done) {
        var d = {}
        var resolveD
        var res = Promise.all([A, B, C, new Promise(function (resolve) { resolveD = resolve })])
        assert(res instanceof Promise)
        res.then(function (res) {
          assert(Array.isArray(res))
          assert(res[0] === a)
          assert(res[1] === b)
          assert(res[2] === c)
          assert(res[3] === d)
        })
        .finally(done)
        resolveD(d)
      })
    })
    describe('of mixed values', function () {
      it('returns a promise for an array containing the fulfilled values', function (done) {
        var res = Promise.all([A, b, C])
        assert(res instanceof Promise)
        res.then(function (res) {
          assert(Array.isArray(res))
          assert(res[0] === a)
          assert(res[1] === b)
          assert(res[2] === c)
        })
        .finally(done)
      })
    })
    describe('containing at least one rejected promise', function () {
      it('rejects the resulting promise', function (done) {
        var res = Promise.all([A, rejected, C])
        assert(res instanceof Promise)
        res.then(function (res) {
          throw new Error('Should be rejected')
        },
        function (err) {
          assert(err === rejection)
        })
        .finally(done)
      })
    })
    describe('containing at least one eventually rejected promise', function () {
      it('rejects the resulting promise', function (done) {
        var rejectB
        var rejected = new Promise(function (resolve, reject) { rejectB = reject })
        var res = Promise.all([A, rejected, C])
        assert(res instanceof Promise)
        res.then(function (res) {
          throw new Error('Should be rejected')
        },
        function (err) {
          assert(err === rejection)
        })
        .finally(done)
        rejectB(rejection)
      })
    })
    describe('when given a foreign promise', function () {
      it('should provide the correct value of `this`', function (done) {
        var p = {then: function (onFulfilled) { onFulfilled({self: this}) }}
        Promise.all([p]).then(function (res) {
          assert(p === res[0].self)
        }).finally(done)
      })
    })
  })
})

describe('Promise.race(...)', function () {
  describe('an array', function () {
    describe('that is empty', function () {
      it('returns a promise for an empty array', function (done) {
        var res = Promise.race([])
        assert(res instanceof Promise)
        res.then(function (res) {
          // never reach here
          assert(false)
        })
        setTimeout(done, 50)
      })
    })
    describe('of objects', function () {
      it('returns a promise for the array', function (done) {
        var res = Promise.race([a, b, c])
        assert(res instanceof Promise)
        res.then(function (res) {
          assert(res.id === a.id)
        }).catch(function() {
          console.log('        ***WARNING***: should NEVER reach here')
          // never reach here
          assert(false)
        }).finally(done)
      })
    })
    describe('of promises', function () {
      it('returns a promise for an array containing the fulfilled values', function (done) {
        var res = Promise.race([A, B, C])
        assert(res instanceof Promise)
        res.then(function (res) {
          assert(res.id === a.id)
        }).catch(function() {
          console.log('        ***WARNING***: should NEVER reach here')
          // never reach here
          assert(false)
        }).finally(done)
      })
    })
    describe('of mixed values', function () {
      it('returns a promise for an array containing the fulfilled values', function (done) {
        var res = Promise.race([A, b, C])
        assert(res instanceof Promise)
        res.then(function (res) {
          assert(res.id === a.id)
        }).catch(function() {
          console.log('        ***WARNING***: should NEVER reach here')
          // never reach here
          assert(false)
        }).finally(done)
      })
    })
    describe('containing at least one rejected promise', function () {
      it('rejects the resulting promise NOT at top', function (done) {
        var res = Promise.race([A, rejected, C])
        assert(res instanceof Promise)
        res.then(function (res) {
          assert(res.id === a.id)
        }).catch(function() {
          console.log('        ***WARNING***: should NEVER reach here')
          // never reach here
          assert(false)
        }).finally(done)
      })

      it('rejects the resulting promise at top', function (done) {
        var res = Promise.race([rejected, B, C])
        assert(res instanceof Promise)
        res.then(function (res) {
          console.log('        ***WARNING***: should NEVER reach here')
          // never reach here
          assert(false)
        }).catch(function(res) {
          assert(res.id === rejection.id)
        }).finally(done)
      })
    })
    describe('when given a foreign promise', function () {
      it('should provide the correct value of `this`', function (done) {
        var p = {then: function (onFulfilled) { onFulfilled({self: this}) }}
        Promise.race([p]).then(function (res) {
          assert(p === res.self)
        }).finally(done)
      })
    })
  })
})
