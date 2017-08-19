

function getpos(r, c) {
	return "[" + c + "*ld" + r + "]";
}

function Argument(name, r, c) {
	this.name = name;
	this.r = r;
	this.c = c;
	this.deps = [];
}
Argument.prototype.toString = function() {
	return this.name + "[" + this.r + " x " + this.c + "]";
}

function Constant(value) {
	this.value = value;
	this.deps = [];
}
Constant.prototype.toString = function() {
	return this.value.toString();
}

function Random() {
	this.deps = [];
}
Random.prototype.toString = function() {
	return "(rand)";
}

function Compiler() {
	
}

function Kernel(rand, body, deps) {
	this.rand = rand;
	this.body = body;
	this.deps = deps;
}

function PartialArith(code) {
	this.code = code;
}
PartialArith.prototype.use = function(f) {
	return f(this.code);
}

function PartialCode(code)

function binary(op) {
	return {
		compile: function(cc, self, r, c) {
			var
				lhs = self.args[0].compile(cc, r, c),
				rhs = self.args[1].compile(cc, r, c);
			
			return new Kernel(
				lhs.rand || rhs.rand,
				"(" + lhs.code + op + rhs.code + ")",
				lhs.deps.concat(rhs.deps)
			);
		}
	};
}

function func(name) {
	return {
		compile: function(cc, self, r, c) {
			var x = self.args[0].compile(cc, r, c);
			
			return new Kernel(
				x.rand,
				name + "(" + x.code + ")",
				x.deps
			);
		}
	};
}

var flux_ops = {
	"+": binary("+"),
	"-": binary("-"),
	"*": binary("*"),
	"/": binary("/"),
	"abs": func("fabs"),
	"sqrt": func("sqrt"),
	"tanh": func("tanh"),
	
	"matmul": function(cc, self, r, c) {
		var
			lhs = self.args[0].compile(cc, r, c),
			rhs = self.args[1].compile(cc, r, c);
		
		return new Kernel(
			lhs.rand || rhs.rand,
			"\tfloat val = 0;\n" +
			"\tfor(int k = 0; k < size; ++k) {\n" +
			"\t\tval += " + lhs.code + "*" + rhs.code + ";\n" +
			"\t}\n
	}
};

function flux_mk_op(op) {
	return function(x) {
		if(typeof x == "number") {
			x = new Constant(x);
		}
		return new Flux(op, [this, x]);
	}
}

function Flux(op, pre, post) {
	if(typeof this == "undefined") {
		return new Flux(op, args);
	}
	
	this.op = op;
	this.args = args;
	this.deps = [];
	
	for(var i = 0; i < args.length; ++i) {
		args[i].deps.push(this);
	}
}
Flux.prototype.add = flux_mk_op("+");
Flux.prototype.sub = flux_mk_op("-");
Flux.prototype.mul = flux_mk_op("*");
Flux.prototype.div = flux_mk_op("/");

Flux.prototype.toString = function() {
	return "(" + this.op + " " + this.args.join(" ") + ")";
}

Flux.ops = flux_ops;

Flux.rand = function() {
	return new Random();
}
Flux.arg = function(name, r, c) {
	return new Argument(name, r, c);
}
Flux.state = function(name, r, c, trainable) {
	return new State(name, r, c, trainable);
}

Flux.abs = function(x) {
	return new Flux("fabs", [x]);
}
Flux.sqrt = function(x) {
	return new Flux("sqrt", [x]);
}
Flux.tanh = function(x) {
	return new Flux("tanh", [x]);
}

Flux.matmul = function(x, y) {
	return new Flux("matmul", [x, y]);
}
Flux.sum = function(x) {
	return new Flux("sum", [x]);
}

module.exports = Flux;
