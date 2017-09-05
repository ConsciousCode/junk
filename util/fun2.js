'use strict';

function* map(v, f) {
	for(let x of v) {
		yield f(x);
	}
}

function sum(v) {
	return v.reduce((acc, v) => acc + v);
}

module.exports = {
	map, sum
};

