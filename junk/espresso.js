'use strict';

const Tokenizer = require("./tokenizer");

class ASTNode {
	toString() {
		return `[${this.tok.type} : ${this.tok[0]}]`;
	}
}

class ASTInt extends ASTNode {
	constructor(tok) {
		super();
		this.value = tok[0]|0;
		this.tok = tok;
	}
	
	toString() {
		return this.value + "";
	}
}

class ASTBinaryOp extends ASTNode {
	constructor(tok, a, b) {
		super();
		this.op = tok[0];
		this.tok = tok;
		
		this.lhs = a;
		this.rhs = b;
	}
	
	toString(prec) {
		let
			op = BINOPS[this.op],
			a = this.lhs.toString(op.prec),
			b = this.rhs.toString(op.prec);
		
		if(op.prec >= (prec|0)) {
			return `${a} ${this.op} ${b}`;
		}
		return `(${a} ${this.op} ${b})`;
	}
}

const TOK = {
	"number": /\d+/,
	'operator': /[-+*\/]/,
	"lparen": "(", "rparen": ")"
};

const BINOPS = {
	"+": {prec: 1, rassoc: false},
	"-": {prec: 1, rassoc: false},
	"*": {prec: 2, rassoc: false},
	"/": {prec: 2, rassoc: false}
};

function binary_op(t) {
	let tok = t.next();
	if(tok) {
		if(tok.type == 'operator') {
			let bo = BINOPS[tok[0]];
			return {tok, prec: bo.prec, rassoc: bo.rassoc};
		}
		
		t.push(tok);
	}
	
	return null;
}

function emsg(expect) {
	return t => {
		if(t) {
			return "Expected " + expect + ", got " + t.type;
		}
		
		return "Expected " + expect;
	};
}

function parse_atom(t) {
	let tok = t.expect([], emsg("value"));
	switch(tok.type) {
		case "number":
			return new ASTInt(tok);
		
		case "lparen":
			let expr = parse_expr(t, parse_atom(t), 0);
			t.expect(["rparen"], emsg(")"));
			return expr;
		
		default:
			throw new Error("Expected expression, got " + tok.type);
	}
}

function parse_expr(t, lhs, prec) {
	let la = binary_op(t);
	while(la && la.prec >= prec) {
		let op = la, rhs = parse_atom(t);
		
		la = binary_op(t);
		while(la && (la.prec > op.prec || la.rassoc && la.prec == op.prec)) {
			t.push(la.tok);
			rhs = parse_expr(t, rhs, la.prec);
			la = binary_op(t);
		}
		
		lhs = new ASTBinaryOp(op.tok, lhs, rhs);
	}
	
	if(la) {
		t.push(la.tok);
	}
	
	return lhs;
}

function parse(code) {
	let t = new Tokenizer(code, TOK, {ignore: /\s+/});
	
	return parse_expr(t, parse_atom(t), 0);
}

module.exports = parse;

