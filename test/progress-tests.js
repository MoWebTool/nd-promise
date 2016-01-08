var assert = require('better-assert')
var Promise = require('../src/core')

describe("Promise#progress(listener)", function() {
  describe('Promise.notify(progress)', function() {
    it('basic', function(done) {
      Promise.notify(45)
        .progress(function(value) {
          assert(value === 45)
          done()
        })
    })
  })
  describe('common use', function() {
    it('basic', function(done) {
      var times = 0
      new Promise(function(resolve, reject, notify) {
        notify(40)
        setTimeout(function() {
          times = 1
          notify(55)
        }, 50)
      }).progress(function(value) {
        if (times === 0) {
          assert(value === 40)
        } else {
          assert(value === 55)
          done()
        }
      })
    })
    it('with resolve', function(done) {
      var progress = 0
      new Promise(function(resolve, reject, notify) {
        notify((progress = 40))
        resolve(15)
        setTimeout(function() {
          notify((progress = 55))
        }, 50)
      }).then(function(value) {
        assert(value === 15)
      }).progress(function(value) {
        assert(value === progress)
        if (progress === 55) {
          // never reach here
          assert(false)
        }
      })
      setTimeout(done, 100)
    })
    it('with reject', function(done) {
      var progress = 0
      new Promise(function(resolve, reject, notify) {
        notify((progress = 40))
        reject(15)
        setTimeout(function() {
          notify((progress = 55))
        }, 50)
      }).catch(function(value) {
        assert(value === 15)
      }).progress(function(value) {
        assert(value === progress)
        if (progress === 55) {
          // never reach here
          assert(false)
        }
      })
      setTimeout(done, 100)
    })
  })
})
