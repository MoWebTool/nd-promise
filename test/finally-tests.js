var assert = require('better-assert')
var Promise = require('../index')

describe("Promise#finally(done)", function() {

  describe("no value is passed in", function() {
    it("does not provide a value to the finally code", function(done) {
      var fulfillmentValue = 1
      var promise = Promise.resolve(fulfillmentValue)

      promise['finally'](function() {
        assert(arguments.length === 0)
        done()
      })
    })

    it("does not provide a reason to the finally code", function(done) {
      var rejectionReason = new Error()
      var promise = Promise.reject(rejectionReason)

      promise['finally'](function() {
        assert(arguments.length === 0)
        done()
      })
    })
  })

  describe("non-exceptional cases do not affect the result", function() {
    it("preserves the original fulfillment value even if the finally callback returns a value", function(done) {
      var fulfillmentValue = 1
      var promise = Promise.resolve(fulfillmentValue)

      promise.then(function(value) {
        assert(fulfillmentValue === value)
        return value
      }).catch(function() {
        console.log('        ***WARNING***: should NEVER reach here')
        // never reach here
        assert(false)
      })['finally'](function() {
        assert(arguments.length === 0)
        done()
      })
    })

    it("preserves the original rejection reason even if the finally callback returns a value", function(done) {
      var rejectionReason = new Error()
      var promise = Promise.reject(rejectionReason)

      promise.then(function() {
        console.log('        ***WARNING***: should NEVER reach here')
        // never reach here
        assert(false)
      }).catch(function(reason) {
        assert(rejectionReason === reason)
      })['finally'](function() {
        assert(arguments.length === 0)
        done()
      })
    })
  })

})
