#include "flux.h"

//Defines to make it easier to make this fixed-point later
#define ADD(x, y) ((x) + (y))
#define MUL(x, y) ((x)*(y))
#define DIV(x, y) ((x)/(y))

#define CMD 0700

#define CMD_SO 0 //scalar op (some transformation using a scalar)
#define CMD_UO 1 //unary op (something of the form z = a*f(y))
#define CMD_VO 2 //vector op (some combination of the elements of two vectors)
#define CMD_LA 3 //linear algebra op

#if USE_CUDA
	__global__ SCALAR kernel_elemwise(
			struct Command* prog, SCALAR** stack, int T, int ret, int n
	) {
		SCALAR tmp[T];
		int id = blockIdx.x*blockDim.x + threadIdx.x;
		
		do {
			switch(prog->op) {
				//z = a + y
				case 0000:
					tmp[z] = ADD(prog->alpha, stack[prog->y][id]);
					break;
				//z = ay
				case 0001:
					tmp[z] = MUL(prog->alpha, stack[prog->y][id]);
					break;
				//z = a/y
				case 0002:
					tmp[z] = DIV(prog->alpha, stack[prog->y][id]);
					break;
				
				//z = a*abs(y)
				case 0100:
					tmp[z] = MUL(prog->alpha, fabsf(stack[prog->y][id]));
					break;
				//z = a*sqrt(y)
				case 0101:
					tmp[z] = MUL(prog->alpha, sqrtf(stack[prog->y][id]));
					break;
				//z = a*exp(y)
				case 0102:
					tmp[z] = MUL(prog->alpha, expf(stack[prog->y][id]));
					break;
				
				//z = x + y
				case 0200:
					tmp[z] = ADD(stack[prog->x][id], stack[prog->y][id]);
					break;
				//z = x*y
				case 0201:
					tmp[z] = MUL(stack[prog->x][id], stack[prog->y][id]);
					break;
				//z = x/y
				case 0202:
					tmp[z] = DIV(stack[prog->x][id], stack[prog->y][id]);
					break;
				
				default:
					break;
			}
			
			++prog;
		//Elementwise operations can be batched, linalg cannot
		} while((prog->op & CMD) != CMD_LA);
		
		return tmp[ret];
	}
	
	
#endif

void flux_compile(struct Flux* result, struct FluxProgram* prog) {
	int s = flux_size(result);
	
	
	
}
