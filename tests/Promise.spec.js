var Promise = require('../Promise');

describe('Promise', function() {
	describe('Promise._setImmediateFn', function() {
		it('changes immediate fn', function() {
			var spy = jasmine.createSpy('callback').and.callFake(function(fn) {
				fn();
			});
			Promise._setImmediateFn(spy);
			var done = false,
				a = new Promise(function(resolve, reject) {
				resolve();
			}).then(function() {
				done = true;
			});
			expect(spy).toHaveBeenCalled();
			expect(done).toBe(true);
		});
		it('changes immediate fn multiple', function() {
			var spy1 = jasmine.createSpy('callback').and.callFake(function(fn) {
				fn();
			});
			var spy2 = jasmine.createSpy('callback').and.callFake(function(fn) {
				fn();
			});
			Promise._setImmediateFn(spy1);
			var done = false,
				a = new Promise(function(resolve, reject) {
				resolve();
			}).then(function() {});
			Promise._setImmediateFn(spy2);

			a = new Promise(function(resolve, reject) {
				resolve();
			}).then(function() {
				done = true;
			});
			expect(spy2).toHaveBeenCalled();
			expect(spy1.calls.count()).toBe(1);
			expect(done).toBe(true);
		});
	});
	describe('notify progress', function() {
		it('basic', function(done) {
			var progress = 0;
			var times = 0;
			var a = new Promise(function(resolve, reject, notify) {
				notify(40);
				setTimeout(function() {
					times = 1;
					notify(15);
				}, 50);
			}).progress(function(value) {
				progress += value;
				if (times === 0) {
					expect(progress).toBe(40);
				} else {
					expect(progress).toBe(40+15);
				}
			});

			setTimeout(done, 1000);
		});
		it('with resolve', function(done) {
			var a = new Promise(function(resolve, reject, notify) {
				notify(40);
				setTimeout(function() {
					resolve(15);
				}, 50);
			}).then(function(value) {
				expect(value).toBe(15);
			}).progress(function(value) {
				expect(value).toBe(40);
			});

			setTimeout(done, 1000);
		});
		it('with reject', function(done) {
			var a = new Promise(function(resolve, reject, notify) {
				notify(40);
				setTimeout(function() {
					reject(15);
				}, 50);
			}).catch(function(value) {
				expect(value).toBe(15);
			}).progress(function(value) {
				expect(value).toBe(40);
			});

			setTimeout(done, 1000);
		});
	});
});
