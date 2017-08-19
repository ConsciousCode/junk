/**
 * Generator utility
**/
function* range(begin, end, incr=1) {
	for(let i = begin; i < end; i += incr) {
		yield i;
	}
}

/**
 * Limit the given generator to n terms.
**/
function* limit(n, g) {
	let i = 0;
	for(let v of g) {
		yield v;
		if(++i > n) {
			break;
		}
	}
}

/**
 * Generates unique random numbers [0, m) using fisher-yates
**/
function* randenum(n) {
	//Ensure uniqueness
	let a = [0];
	
	for(let i = 1; i < n; ++i) {
		let j = (Math.random()*(i + 1))|0;
		
		if(j == i) {
			a.push(i);
		}
		else {
			a.push(a[j]);
			a[j] = i;
		}
	}
	
	yield* a;
}

function* map(v, f) {
	for(let x of v) {
		yield f(x);
	}
}

function sum(v) {
	return v.reduce((acc, v) => acc + v);
}

module.exports = {
	range, limit, randenum, map, sum
};
