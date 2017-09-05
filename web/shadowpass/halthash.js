'use strict';

function bigmod(big, mod) {
	let bigger = new Uint8Array(big.buffer);
	
	const BASE = 1<<8;
	
	// a + b mod c = (a mod c) + (b mod c) mod c
	// ab mod c = (a mod c)(b mod c) mod c
	
	let powmod = 1, acc = 0;
	
	// Scan over the lil-endian buffer and compute the accumulated
	//  modulus for the big number.
	for(let i = 0; i < bigger.length; ++i) {
		// powmod is BASE^i % mod
		let digit = (bigger[i]%mod)*powmod;
		// acc accumulates the modulus value
		acc = (acc + digit%mod)%mod;
		powmod = (powmod*BASE)%mod;
	}
	
	return acc;
}

function str2buf(str) {
	return new TextEncoder("UTF-8").encode(str);
}

async function H(x) {
	return await crypto.subtle.digest("SHA-256", x);
}

async function H2(a, b) {
	let ab = new Uint8Array(64);
	
	ab.set(a);
	ab.set(b, 32);
	
	return await H(ab);
}

const Q = 8;

async function halt_prepare(pw, stop) {
	let salt = crypto.randomBytes(32), secret = await H(str2buf(pw));
	let z = await H2(secret, salt), y = [];
	
	while(!stop()) {
		y.push(z);
		
		for(let i = 0; i < Q; ++i) {
			let j = bigmod(z, y.length);
			
			z = await H2(z, y[j], z);
		}
	}
	
	return {
		key: await H2(z, r),
		verify: {
			halt: await H2(y[0], z),
			salt: salt
		}
	};
}

async function halt_extract(pw, verify, stop) {
	let salt = verify.salt, halt = verify.halt;
	
	let secret = await H(pw);
	let z = await H2(secret, salt), y = [];
	
	while(!stop()) {
		y.push(z);
		
		for(let i = 0; i < Q; ++i) {
			let j = bigmod(z, y.length);
			
			z = await H2(z, y[j]);
		}
		
		if(H2(y[0], z) == halt) {
			return await H2(z, salt);
		}
	}
	
	throw new Error("Halthash extraction failed");
}
