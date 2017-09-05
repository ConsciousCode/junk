'use strict';

var
	cl = require("nooocl"),
	ref = require("ref");

var sess = (function() {
	var host = cl.CLHost.createV11(), defs = host.cl.defs;
	
	var platform = host.getPlatforms()[0];
	
	var context = cl.CLContext(
		platform.getDevices(
			platform.cl.defs.CL_DEVICE_TYPE_GPU |
			platform.cl.defs.CL_DEVICE_TYPE_CPU
		)
	);
	
	var dev = (function() {
		var platforms = host.getPlatforms();
		
		for(var i = 0; i < platforms.length; ++i) {
			var devs = platforms[i].gpuDevices();
			if(devs.length) {
				return devs[0];
			}
		}
	})();
	
	return {
		host: host,
		device: dev,
		context: context,
		queue: cl.CLCommandQueue(context, dev)
	};
})();

var prog, todo = [];

function process(f) {
	if(todo) {
		todo.push(f);
	}
	else {
		f(prog);
	}
}

fs.stat("qortex.bin", function(berr, stats) {
	fs.readFile(berr?"qortex.cl":"qortex.bin", function(err, data) {
		if(err) {
			throw err;
		}
		
		prog = sess.context.createProgram(data, sess.device);
		
		if(berr) {
			prog.build('-cl-fast-relaxed-math').then(function() {
				for(var i = 0; i < todo.length; ++i) {
					todo[i](prog);
				}
				
				todo = null;
				
				fs.writeFile("qortex.bin", prog.getBinaries()[0]);
			});
		}
		else {
			for(var i = 0; i < todo.length; ++i) {
				todo[i](prog);
			}
			
			todo = null;
		}
	});
});

function cl_buffer(size) {
	return new CLBuffer(
		sess.context,
		sess.host.defs.CL_MEM_READ_WRITE,
		size*ref.types.float.size
	);
}

function Jar() {
	
}

function Batch(size, max) {
	this.size = size;
	this.max = max;
	this.pos = 0;
	this.last = 0;
	this.buffer = cl_buffer(size*max*2);
	this.onfeed = null;
}
Batch.prototype.next = function() {
	if(this.pos >= this.last) {
		this.onfeed(function
}

function Cell(layers) {
	this.layers = layers;
}
Cell.prototype.build = function(insize) {
	for(var i = 0; i < this.layers.length; ++i) {
		insize = this.layers[i].set_input_size(insize);
	}
}
Cell.prototype.forward = function(input) {
	for(var i = 0; i < this.layers.length; ++i) {
		input = this.layers[i].forward(input);
	}
	
	return input;
}
Cell.prototype.backward = function(grad) {
	for(var i = this.layers.length - 1; i >= 0; --i) {
		grad = this.layers[i].backward(grad);
	}
	
	return grad;
}

function Adadelta(i, o, act) {
	this.rows = i;
	this.cols = o;
	this.Wb = cl_buffer(i*o);
	this.g_sq = cl_buffer(i*o);
	this.d_sq = cl_buffer(i*o);
	this.act = act;
}
Adadelta.prototype.update = function(i, g) {
	//Wb, in, grad, r, c, g_sq, d_sq, act
	sess.kernels.adadelta.setArgs(
		this.Wb, in, g, {'int': this.rows}, {'int': this.cols},
		this.g_sq, this.d_sq, {'int': this.act}
	);
	
	sess.queue.enqueueNDRangeKernel(
		sess.kernels.adadelta, new cl.NDRange(this.rows, this.cols), null
	);
}

function Transform(outsize, act) {
	this.insize = 0;
	this.outsize = outsize;
	this.Wb = null;
	this.act = {
		"linear": 0,
		"squash": 1,
		"psquash": 2
	}[act || "squash"];
}
Transform.set_input_size = function(size) {
	this.insize = size;
	
	this.Wb = new Adadelta(size + 1, this.outsize);
}
Transform.prototype.forward = function(input) {
	//Wb, r, c, input, output, act
	kernels.transform.setArgs(
		this.Wb, {'int': this.outsize}, {'int':this.insize},
		input, this.output, {'int': this.act}
	);
}
Transform.prototype.backward = function(grad) {
	//Wb, r, c, input, output, act
	kernels.transform_grad.setArgs(
		this.Wb, {'int': this.outsize}, {'int':this.insize},
		input, this.output, {'int': this.act}
	);
}
