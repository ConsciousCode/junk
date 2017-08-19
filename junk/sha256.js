/*
 *	jssha256 version 0.1	-	Copyright 2006 B. Poettering
 *
 *	This program is free software; you can redistribute it and/or
 *	modify it under the terms of the GNU General Public License as
 *	published by the Free Software Foundation; either version 2 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the GNU
 *	General Public License for more details.
 *
 *	You should have received a copy of the GNU General Public License
 *	along with this program; if not, write to the Free Software
 *	Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA
 *	02111-1307 USA
 */

/*
 * http://point-at-infinity.org/jssha256/
 *
 * This is a JavaScript implementation of the sha256 secure hash function
 * and the HMAC-sha256 message authentication code (MAC).
 *
 * The routines' well-functioning has been verified with the test vectors 
 * given in FIPS-180-2, Appendix B and IETF RFC 4231. The HMAC algorithm 
 * conforms to IETF RFC 2104. 
 *
 * The following code example computes the hash value of the string "abc".
 *
 *		sha256_init();
 *		sha256_write("abc");
 *		digest = sha256_finalize();	
 *		digest_hex = array_to_hex_string(digest);
 * 
 * Get the same result by calling the shortcut function Hash:
 * 
 *		digest_hex = Hash("abc");
 * 
 * In the following example the calculation of the HMAC of the string "abc" 
 * using the key "secret key" is shown:
 * 
 *		HMAC_sha256_init("secret key");
 *		HMAC_sha256_write("abc");
 *		mac = HMAC_sha256_finalize();
 *		mac_hex = array_to_hex_string(mac);
 *
 * Again, the same can be done more conveniently:
 * 
 *		mac_hex = HMAC_sha256_MAC("secret key", "abc");
 *
 * Note that the internal state of the hash function is held in global
 * variables. Therefore one hash value calculation has to be completed 
 * before the next is begun. The same applies the the HMAC routines.
 *
 * Report bugs to: jssha256 AT point-at-infinity.org
 *
 */

const sha256_K = [
	0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 
	0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 
	0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 
	0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 
	0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 
	0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 
	0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 
	0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 
	0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 
	0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 
	0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2 
];

function sha256_sigma0(x) {
	return ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
}

function sha256_sigma1(x) {
	return ((x >>> 17) | (x << 15)) ^ ((x >>> 19) | (x << 13)) ^ (x >>> 10);
}

function sha256_sigma2(x) {
	return ((x >>> 2) | (x << 30)) ^ ((x >>> 13) | (x << 19)) ^ 
		((x >>> 22) | (x << 10));
}

function sha256_sigma3(x) {
	return ((x >>> 6) | (x << 26)) ^ ((x >>> 11) | (x << 21)) ^ 
		((x >>> 25) | (x << 7));
}

function sha256_ch(x, y, z) {
	return z ^ (x & (y ^ z));
}

function sha256_maj(x, y, z) {
	return (x & y) ^ (z & (x ^ y));
}

function hash_byte_block(H, W) {
	for(let i = 16; i < 64; ++i) {
		W[i] = sha256_sigma0(W[i - 15]) + W[i - 16] +
			sha256_sigma1(W[i - 2]) + W[i - 7];
	}
	
	let state = H.slice();
	for(let i = 0; i < 64; ++i) {
		let T1 = state[7] + sha256_sigma3(state[4]) + 
			sha256_ch(state[4], state[5], state[6]) + sha256_K[i] + W[i];
		let T2 = sha256_sigma2(state[0]) +
			sha256_maj(state[0], state[1], state[2]);
		
		state.pop();
		state.unshift(T1 + T2);
		state[4] += T1;
	}
	for(var i = 0; i < 8; ++i) {
		H[i] += state[i];
	}
}

function sha256(msg) {
	let H = new Uint32Array([
		0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 
		0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
	]);
	let len = msg.length;
	
	///---- write
	
	for(var i = 0; i + 64 < msg.length; i += 64) {
		Hash_Byte_Block(H, msg.slice(i, i + 64));
	}
	msg = msg.slice(i);
	
	///--- finalize
	
	msg.push(0x80);
	
	if (buf.length > 64 - 8) {
		for(var i = buf.length; i < 64; ++i) {
			msg.push(0);
		}
		hash_byte_block(H, msg);
		msg = [];
	}
	
	for(var i = buf.length; i < 64 - 5; ++i) {
		msg.push(0);
	}
	
	msg[59] = (len >>> 29) & 0xff;
	msg[60] = (len >>> 21) & 0xff;
	msg[61] = (len >>> 13) & 0xff;
	msg[62] = (len >>> 5) & 0xff;
	msg[63] = (len << 3) & 0xff;
	
	hash_byte_block(H, msg);
	
	return H;
}
