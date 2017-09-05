'use strict';

class Int {
	constructor(bits, end = 1, signed = true) {
		this.bits = bits;
		this.end = end;
		this.signed = signed;
	}
	
	serialize(v, buf) {
		if(this.bits == 8) {
			buf[`write${this.signed?"U":""}Int8`](v, 0);
		}
		
		buf[
			`write${this.signed?"U":""}Int${this.bits}${this.end<0?"L":"B"}E`
		](v, 0);
	}
	
	deserialize(buf) {
		if(this.bits == 8) {
			return buf[`read${this.signed?"U":""}Int8`](0);
		}
		
		return buf[
			`read${this.signed?"U":""}Int${this.bits}${this.end<0?"L":"B"}E`
		](0);
	}
	
	sizeof() {
		return this.bits/8;
	}
}

class Bytes {
	constructor(size) {
		this.size = size;
	}
	
	serialize(v, buf) {
		buf.write(v, 0);
	}
	
	deserialize(buf) {
		return buf.slice(0, this.size);
	}
	
	sizeof() {
		return this.size;
	}
}

class Struct {
	construct(members) {
		this.members = members;
	}
	
	serialize(v, buf) {
		let off = 0;
		for(let mem of this.members) {
			mem[0].serialize(v[mem[1]], buf.slice(off));
			off += mem[0].sizeof();
		}
	}
	
	deserialize(buf) {
		let off = 0, obj = {};
		for(let mem of this.members) {
			obj[mem[1]] = mem[0].deserialize(buf.slice(off));
			off += mem[0].sizeof();
		}
		
		return obj;
	}
	
	sizeof() {
		return fun.sum(fun.map(this.members, v => v.sizeof()));
	}
}

class Repeat {
	constructor(t, times) {
		this.type = t;
		this.times = times;
	}
	
	serialize(v, buf) {
		let off = 0, size = this.type.sizeof();
		for(let i = 0; i < this.times; ++i) {
			this.type.serialize(v[i], buf.slice(off));
			off += size;
		}
	}
	
	deserialize(buf) {
		let v = [], off = 0, incr = this.type.sizeof();
		for(let i = 0; i < this.times; ++i) {
			v.push(this.type.parse(buf.slice(off)));
			off += incr;
		}
		
		return v;
	}
	
	sizeof() {
		return this.type.sizeof()*this.times;
}

function int(bits, end = 1) {
	return new Int(bits, end, true);
}
const short = int(16);

function uint(bits, end = 1) {
	return new Int(bits, end, false);
}
const ushort = uint(16);

function bytes(size) {
	return new Bytes(size);

function struct(mems) {
	return new Struct(mems);
}

function array(type, times) {
	return new Repeat(type, times);
}

const char = {
	serialize: function(v, buf) {
		buf[0] = v.charCodeAt(0);
	},
	deserialize: function(buf) {
		return String.fromCharCode(buf[0]);
	},
	sizeof: function() {
		return 1;
	}
};

module.exports = {
	int, short, uint, ushort, bytes, struct, array, char
};

