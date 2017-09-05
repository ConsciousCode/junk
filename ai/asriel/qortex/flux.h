#ifndef TENSOR_FLUX_H
#define TENSOR_FLUX_H

#define SCALAR float

/**
 * Structure encoding a command in the CUDA state machine.
**/
struct Command {
	/**
	 * Indicates what should be done with the data.
	**/
	unsigned char op;
	
	/**
	 * All commands take either a scalar or input tensor as the first parameter.
	**/
	union {
		SCALAR alpha;
		int x;
	};
	
	/**
	 * All commands take either a scalar or input tensor as the second
	 *  parameter.
	**/
	union {
		SCALAR beta;
		int y;
	};
	
	/**
	 * The output tensor.
	**/
	int z;
};

/**
 * Basic tensor structure, used to keep track of data on the GPU.
**/
struct Tensor {
	SCALAR* dev_data;
	unsigned rows, cols;
};

/**
 * A node in an acyclical data flow graph used for simplifying graph
 *  compilation.
**/
struct Flux {
	/**
	 * The operation to perform.
	**/
	enum Operation {
		ADD,
		MUL,
		DIV,
		CONST,
		CONCAT
	} op;
	
	union {
		SCALAR alpha;
		struct Flux* x;
	};
	
	union {
		SCALAR beta;
		struct Flux* y;
	};
};

/**
 * A compiled flux program.
**/
struct FluxProgram {
	struct Command* prog;
	unsigned size;
};

/**
 * Compile the flux graph into a flux program.
**/
void flux_compile(struct Flux* result, /* OUT */ struct FluxProgram* prog);

/**
 * Execute the given flux program with its inputs.
**/
void flux_exec(struct FluxProgram* prog, struct Tensor* inputs);

#endif
