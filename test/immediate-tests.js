var assert = require('better-assert')
var Promise = require('../Promise')

describe('Promise._setImmediateFn', function() {
  it('changes immediate fn', function() {
    var called = 0
    var spy = function(fn) {
      fn()
      called += 1
    }
    Promise._setImmediateFn(spy)
    var done = false,
      a = new Promise(function(resolve, reject) {
        resolve()
      }).then(function() {
        done = true
      })
    assert(called === 1)
    assert(done === true)
  })
  it('changes immediate fn multiple', function() {
    var called = 0
    var spy = function(fn) {
      fn()
      called += 1
    }
    var called2 = 0
    var spy2 = function(fn) {
      fn()
      called2 += 1
    }
    Promise._setImmediateFn(spy)
    var done = false,
      a = new Promise(function(resolve, reject) {
        resolve()
      }).then(function() {})
    Promise._setImmediateFn(spy2)

    a = new Promise(function(resolve, reject) {
      resolve()
    }).then(function() {
      done = true
    })
    assert(called === 1)
    assert(called2 === 1)
    assert(done === true)
  })
})
