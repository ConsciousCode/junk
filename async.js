'use strict';

function nop() {}

/**
 * A promise that can be requested more than once or after
 *  resolution.
**/
class Future extends Promise {
	constructor() {
		super();
		
		this.handlers = [];
		this.value = null;
		this.resolved = false;
		this.rejected = false;
		
		super.then(
			v => {
				this.value = v;
				this.resolved = true;
				for(let h of this.handlers) {
					h.ok(v);
				}
			},
			e => {
				this.value = e;
				this.rejected = true;
				for(let h of this.handlers) {
					h.no(v)
				}
			}
		);
	}
	
	then(ok, no) {
		if(this.resolved) {
			ok(this.value);
		}
		else if(this.rejected) {
			no(this.value);
		}
		else {
			this.handlers.push({ok, no});
		}
		return this;
	}
	
	catch(no) {
		if(this.resolved) {}
		else if(this.rejected) {
			no(this.value);
		}
		else {
			this.handlers.push({nop, no});
		}
		return this;
	}
}

const defer = (() => {
	if(
		typeof process !== 'undefined' &&
		typeof process.nextTick === 'function'
	) {
		return process.nextTick;
	}
	else if(typeof setTimeout === 'function') {
		return function(f) {
			setTimeout(f, 0);
		}
	}
	else {
		return function(f) {
			f();
		}
	}
})();

function wait(time) {
	return new Eventual(
		ok => setTimeout(ok, time)
	);
}

function parallel(todo) {
	let finish = new Future(), count = 0, good = true;
	if(Array.isArray(t)) {
		let vals = new Array(todo.length), i = 0;
		for(let t of todo) {
			t.then(
				v => {
					if(good) {
						vals[i] = v;
						if(++count >= todo.length) {
							finish.resolve(vals);
						}
					}
				},
				e => {
					good = false;
					finish.reject(e);
				}
			);
			++i;
		}
	}
	else {
		let vals = {};
		for(let t in todo) {
			todo[t].then(
				v => {
					vals[t] = v;
					if(++count >= todo.length) {
						finish.reject(vals);
					}
				},
				e => {
					good = false;
					finish.reject(e);
				}
			);
		}
	}
	
	return finish;
}

function sequence(todo) {
	return (async function() {
		let count = 0, vals;
		if(Array.isArray(t)) {
			vals = [];
			for(let t of todo) {
				vals.push(await t(vals));
			}
		}
		else {
			vals = {};
			for(let t in todo) {
				vals[t] = await t(vals);
			}
		}
		
		return vals;
	})();
}

function fallback(todo) {
	return (async function() {
		let count = 0, vals;
		if(Array.isArray(t)) {
			vals = [];
			for(let t of todo) {
				try {
					return await t();
				}
				catch(e) {
					vals.push(e);
				}
			}
		}
		else {
			vals = {};
			for(let t in todo) {
				try {
					return await t();
				}
				catch(e) {
					vals[t] = e;
				}
			}
		}
		
		throw vals;
	})();
}

function race(todo) {
	let finish = new Future(), count = 0;
	if(Array.isArray(t)) {
		for(let t of todo) {
			t.then(
				v => {
					if(++count < todo.length) {
						finish.resolve(v);
					}
				},
				e => {
					if(++count >= todo.length) {
						finish.reject(new Error("No race condition resolved"));
					}
				}
			);
		}
	}
	else {
		for(let t in todo) {
			todo[t].then(
				v => {
					if(++count < todo.length) {
						finish.resolve(vals);
					}
				},
				e => {
					if(++count >= todo.length) {
						finish.reject(new Error("No race condition resolved"));
					}
				}
			);
		}
	}
	
	return finish;
}

module.exports = {
	Future,
	defer, wait,
	parallel, sequence,
	fallback, race
};
