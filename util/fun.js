const range_noend = Symbol("no end");
function* range(b, e=range_noend, s=1) {
	if(e == range_noend) {
		e = b;
		b = 0;
	}
	
	for(let i = b; i < e; i += s) {
		yield i;
	}
}

function* map(gen, f) {
	for(let g of gen) {
		yield f(g);
	}
}

function* filter(gen, f) {
	for(let g of gen) {
		if(f(g)) {
			yield g;
		}
	}
}

function* merge(a, b, f) {
	let ag = a[Symbol.iterator](), bg = b[Symbol.iterator](),
		an, bn;
	
	for(;;) {
		an = ag.next();
		if(an.done) { break; }
		
		bn = bg.next();
		if(bn.done) { break; }
		
		yield f(an, bn);
	}
}
