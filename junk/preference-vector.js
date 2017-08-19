'use strict';

const
	cheerio = require("cheerio");

const
	PREFSIZE = 32,
	VERSION = 0,
	DIGITS =
		"!$%()*+,`-." +
		"0123456789" + ":;=@" +
		"ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "[]^_`"
		"abcdefghijklmnopqrstuvwxyz" + "{|}~"

function mularray(x, n) {
	let carry = 0;
	for(let i = 0; i < x.length; ++i) {
		let total = (x[i] + carry)*n;
		console.log(x[i], total, carry)
		x[i] = total%256;
		carry = (total/256)|0;
	}
}

function addarray(x, n) {
	let carry = 0;
	for(let i = 0; i < x.length && n; ++i) {
		let total = x[i] + carry;
		x[i] = total%256;
		carry = (total/256)|0;
	}
}

class Preference {
	constructor() {
		this.vec = new Uint8Array(PREFSIZE);
	}
	
	fromString(s) {
		let vec = new Uint8Array(PREFSIZE);
		for(let d of s) {
			let digit = DIGITS.indexOf(d);
			mularray(vec, DIGITS.length);
			addarray(vec, digit);
		}
		
		this.vec = vec;
	}
	
	toString() {
		//Done by "filling the bits" of the output string
		// Entropy is tracked by ent, representing the number of possible
		// states. Carry represents any leftover data that's yet to fit.
		let s = "", carry = 0, ent = 0;
		for(let v of this.vec) {
			carry *= 256;
			carry += v;
			ent += 8*Math.LN2;
			
			//While we can fit data into the output, do so
			while(ent >= Math.log(DIGITS.length)) {
				s += DIGITS[carry%DIGITS.length];
				carry = (carry/DIGITS.length)|0;
				ent -= Math.log(DIGITS.length);
			}
		}
		
		return ent? s + DIGITS[carry] : s;
	}
	
	randomize() {
		for(let i = 0; i < this.vec.length; ++i) {
			this.vec[i] = Math.random()*256;
		}
	}
}

let p = new Preference();
p.randomize();

let q = new Preference();
q.fromString(p.toString());
