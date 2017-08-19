#include "linalg.hpp"

#if USE_CUDA
	#include <cuda_runtime.h>
#endif

namespace la {
	cublasHandle_t handle;
	
	struct la_bootstrap {
		la_bootstrap() {
			cublasCreate(&handle);
		}
		
		~la_bootstrap() {
			cublasDestroy(&handle);
		}
	}labs;
	
	float* matrix_alloc(unsigned size);
	void matrix_dealloc(float* data);
	
	MatrixSlice::MatrixSlice() {
		transposed = false;
		offr = 0;
		offc = 0;
	}
	
	MatrixSlice::MatrixSlice(const MatrixSlice& ms) {
		dev_data = ms.dev_data;
		
		offr = ms.offr;
		offc = ms.offc;
		
		r = ms.r;
		c = ms.c;
		
		r0 = ms.r0;
		r1 = ms.r1;
		
		c0 = ms.c0;
		c1 = ms.c1;
	}
	
	float* MatrixSlice::begin(bool at) {
		if(at && transposed) {
			return dev_data + r0*c + c0;
		}
		return dev_data + c0*r + r0;
	}
	
	unsigned MatrixSlice::get_incr() {
		return transposed?r:1;
	}
	
	unsigned MatrixSlice::rows() {
		return transposed?c1 - c0:r1 - r0;
	}
	
	unsigned MatrixSlice::cols() {
		return transposed?r1 - r0:c1 - c0;
	}
	
	MatrixSlice& MatrixSlice::T() {
		transposed = !transposed;
		return *this;
	}
	
	void MatrixSlice::copy(MatrixSlice x) {
		cublasScopy(handle, rows(),
			x.begin(true), x.get_incr(),
			begin(true), get_incr()
		);
	}
	
	MatrixSlice MatrixSlice::slice(unsigned r0, unsigned r1) {
		MatrixSlice ms(*this);
		ms.r1 = ms.r0 + r1;
		ms.r0 += r0;
		
		return ms;
	}
	
	MatrixSlice MatrixSlice::slice(unsigned r0, unsigned r1, unsigned c0, unsigned c1) {
		MatrixSlice ms(*this);
		ms.r1 = ms.r0 + r1;
		ms.r0 += r0;
		
		ms.c1 = ms.c0 + c1;
		ms.c0 += c0;
		
		return ms;
	}
	
	MatrixSlice MatrixSlice::offset(unsigned y, unsigned x) {
		MatrixSlice ms(*this);
		ms.offr = y;
		ms.offc = x;
		
		return ms;
	}
	
	Matrix::Matrix() {
		rows = 0;
		cols = 0;
		dev_data = nullptr;
		host_data = nullptr;
	}
	
	Matrix::~Matrix() {
		if(dev_data) {
			matrix_dealloc(dev_data);
		}
		
		if(host_data) {
			delete[] host_data;
		}
	}
	
	/**
	 * Allocate the space for the matrix. The matrix is not valid until
	 *  this is called.
	**/
	void Matrix::alloc(unsigned r, unsigned c) {
		if(dev_data) {
			matrix_dealloc(dev_data);
		}
		
		dev_data = matrix_alloc(r*c);
		rows = r;
		cols = c;
	}
	
	/**
	 * Fill the matrix with the given value.
	**/
	void Matrix::fill(float v) {
		if(!dev_data) {
			throw std::logic_error(
				"Called Matrix::fill on an unallocated matrix"
			);
		}
		
		Cudadim d = kernel_grid(kernel_set, rows*cols);
		kernel_set<<<d.grid, d.block>>>(dev_data, v, rows*cols);
	}
	
	/**
	 * Fetch data from the device to be read on the host. Matrix owns the
	 *  returned pointer.
	**/
	float* Matrix::fetch() {
		if(!dev_data) {
			throw std::logic_error(
				"Called Matrix::fetch on an unallocated matrix"
			);
		}
		
		if(!host_data) {
			host_data = new float[rows*cols];
		}
		
		cudaMemcpy(
			host_data, dev_data, rows*cols*sizeof(float),
			cudaMemcpyDeviceToHost
		);
	}
	
	void fetch(float* f) {
		if(!dev_data) {
			throw std::logic_error(
				"Called Matrix::fetch on an unallocated matrix"
			);
		}
		
		cudaMemcpy(
			f, dev_data, rows*cols*sizeof(float),
			cudaMemcpyDeviceToHost
		);
	}
	
	/**
	 * Push the given data to the device. The caller owns the given pointer.
	**/
	void Matrix::push(float* d) {
		if(!dev_data) {
			throw std::logic_error(
				"Called Matrix::fetch on an unallocated matrix"
			);
		}
		
		cudaMemcpy(
			dev_data, d, rows*cols*sizeof(float),
			cudaMemcpyHostToDevice
		);
	}
	
	MatrixSlice Matrix::slice() {
		MatrixSlice ms;
		ms.r = rows;
		ms.c = cols;
		
		ms.r0 = 0;
		ms.r1 = ms.rows;
		ms.c0 = 0;
		ms.c1 = ms.cols;
		
		return ms;
	}
	
	MatrixSlice Matrix::slice(unsigned r0, unsigned r1) {
		MatrixSlice ms;
		ms.r = rows;
		ms.c = cols;
		
		ms.r0 = r0;
		ms.r1 = r1;
		ms.c0 = 0;
		ms.c1 = ms.cols;
		
		return ms;
	}
	
	MatrixSlice Matrix::slice(unsigned r0, unsigned r1, unsigned c0, unsigned c1) {
		MatrixSlice ms;
		ms.r = rows;
		ms.c = cols;
		
		ms.r0 = r0;
		ms.r1 = r1;
		ms.c0 = c0;
		ms.c1 = c1;
		
		return ms;
	}
	
	#if USE_CUDA
		#define launch_kernel(f, n) Cudadim __d ## f = kernel_grid(f, n);\
			f<<<d.grid, d.block>>>
		
		float* matrix_alloc(unsigned size) {
			float* res;
			cudaMalloc(&res, size);
			
			return res;
		}
		
		void matrix_dealloc(float* data) {
			cudaFree(&data);
		}
		
		struct Cudadim {
			int grid, block;
		};
		
		template<typename C>
		Cudadim kernel_grid(C kernel, int count) {
			int block_size;
			int min_grid;
			cudaOccupancyMaxPotentialBlockSize(
				&min_grid, &block_size, kernel, 0, 0
			); 
			
			return {(count + block_size - 1)/block_size, block_size};
		}
		
		__device__ int kernel_index() {
			return threadIdx.x + blockIdx.x*blockDim.x;
		}
		
		__global__ void kernel_mxpb(
				float u, float* m, float* x,
				float v, float* b, float* y
				int n
		) {
			int id = kernel_index();
			
			if(id < n) {
				y[id] = u*m[id]*x[id] + v*b[id];
			}
		}
		
		__global__ void kernel_ewlt(
				float a, float* x, float b, float* y, int n
		) {
			int id = kernel_index();
			
			if(id < n) {
				y[id] = a*x[id] + b;
			}
		}
		
		__global__ void kernel_squash(float* x, float* y, int n) {
			int id = kernel_index();
			
			if(id < n) {
				y[id] = x[id]/(1 + fabsf(x[id]));
			}
		}
		
		__global__ void kernel_psquash(float* x, float* y, int n) {
			int id = kernel_index();
			
			if(id < n) {
				y[id] = x[id]/(1 + 2*fabsf(x[id])) + 0.5;
			}
		}
		
		__global__ void kernel_squash_d(float* x, float* y, int n) {
			int id = kernel_index();
			
			if(id < n) {
				float t = 1 + fabsf(x[id]);
				y[id] = 1/(t*t);
			}
		}
		
		__global__ void kernel_psquash_d(float* x, float* y, int n) {
			int id = kernel_index();
			
			if(id < n) {
				float t = 1 + 2*fabsf(x[id]);
				y[id] = 1/(t*t);
			}
		}
		
		__global__ void kernel_additive_noise(int xe, float* x, float* y, int n) {
			int id = kernel_index();
			
			if(id < n) {
				//Deconstruct the IEEE float for extra seeding
				union {
					float f;
					struct {
						unsigned sign : 1;
						unsigned exp : 8;
						unsigned frac : 23;
					};
				} v = x[id];
				
				//Take what little entropy we can get and stretch it out
				// This doesn't need to be secure-random, just uncorrelated
				// to the network
				int seed = ((v.frac + id)*(int)x*(int)y + (int)&x + xe)&((1<<23) - 1);
				
				float u1, u2;
				do {
					//LCG parameters taken from Wikipedia, something
					// something Microsoft
					seed = (seed*0x43FD43FD + 0xC39EC3)&((1<<23) - 1);
					u1 = seed * 1.0f / ((1<<23) - 1);
					
					seed = (seed*0x43FD43FD + 0xC39EC3)&((1<<23) - 1);
					u2 = seed * 1.0f / ((1<<23) - 1);
				} while(u1 <= FLT_EPSILON);
				
				//Use that last bit of entropy from the sign to pick which
				// normal we use; toss the other
				y[id] = (x[id]*15 + (v.sign?
					z0 = sqrt(-2*logf(u1)) * cospif(2*u2):
					z1 = sqrt(-2*logf(u1)) * sinpif(2*u2)
				))/16;
			}
		}
		
		__global__ void kernel_adadelta(float* W, float* g, float* in, float* g_sq, float* d_sq, int r, int c) {
			const float RHO = 0.95, EPS = 1e-6;
			
			int id = kernel_index();
			
			if(id < r*c) {
				int y = id%r, x = id/r;
				float grad;
				
				//Account for bias, in treated as 1
				if(x == c - 1) {
					grad = g[y];
				}
				else {
					grad = in[x]*g[y];
				}
				
				//Running average of g^2
				g_sq[id] = RHO*g_sq[id] + (1 - RHO)*grad*grad;
				
				/*
				//Natural way of thinking about it
				float d =
					sqrtf(d_sq[id] + EPS)/
					sqrtf(g_sq[id] + EPS)*g;
				*/
				//Optimization using the reciprocal of sqrt hack
				float d =
					rsqrtf(g_sq[id] + EPS)/
					rsqrtf(d_sq[id] + EPS)*g;
				
				//Running average of dW^2
				d_sq[id] = RHO*d_sq[id] + (1 - RHO)*d*d;
				
				W[id] -= d;
			}
		}
		
		void gemv(float a, MatrixSlice A, MatrixSlice x, float b, MatrixSlice B) {
			cublasSgemv(handle,
				A.transposed?CUBLAS_OP_T:CUBLAS_OP_N,
				A.rows(), A.cols(), //m, n
				&a, //alpha
				A.begin(), A.rows, //A, lda
				x.begin(true), x.get_incr(), //x, incx
				&b, //beta
				out.begin(true), out.get_incr() //y, incy
			);
		}
		
		void gemm(float a, MatrixSlice A, MatrixSlice B, float b, MatrixSlice C) {
			cublasSgemm(handle,
				A.transposed?CUBLAS_OP_T:CUBLAS_OP_N,
				B.transposed?CUBLAS_OP_T:CUBLAS_OP_N,
				A.rows(), B.cols(), A.cols(), //m, n, k
				&a, //alpha
				A.begin(), A.rows(), //A, lda
				x.begin(), x.rows(), //B, ldb
				&b, //beta
				C.begin(), C.rows() //C, ldc
			);
		}
		
		void geam(float a, MatrixSlice A, float b, MatrixSlice B, MatrixSlice C) {
			cublasSgeam(handle,
				A.transposed?CUBLAS_OP_T:CUBLAS_OP_N,
				B.transposed?CUBLAS_OP_T:CUBLAS_OP_N,
				A.rows(), A.cols(), //m, n
				&a, //alpha
				A.begin(), A.rows(), //A, lda
				&b, //beta
				B.begin(), B.rows(), //B, ldb
				C.begin(), C.rows(), //C, ldc
			);
		}
		
		void axpy(float a, MatrixSlice A, MatrixSlice x, MatrixSlice y) {
			cublasSaxpy(handle,
				A.rows()*A.cols(), &a,
				x.begin(), x.rows(),
				y.begin(), y.rows()
			);
		}
		
		void mxpb(
				float u, MatrixSlice m, MatrixSlice x,
				float v, MatrixSlice b, MatrixSlice y
		) {
			launch_kernel(kernel_mxpb, x.rows()*x.cols())(
				u, m.begin(), x.begin(),
				v, b.begin(), y.begin(), x.rows()*x.cols()
			);
		}
		
		void ewlt(float a, MatrixSlice x, float b, MatrixSlice y) {
			launch_kernel(kernel_ewlt, x.rows()*x.cols())(
				a, x.begin(), b, y.begin(), x.rows()*x.cols()
			);
		}
		
		void squash(MatrixSlice x, MatrixSlice y) {
			launch_kernel(kernel_squash, x.rows()*x.cols())(
				x.begin(), y.begin(), x.rows()*x.cols()
			);
		}
		
		void psquash(MatrixSlice x, MatrixSlice y) {
			launch_kernel(kernel_psquash, x.rows()*x.cols())(
				x.begin(), y.begin(), x.rows()*x.cols()
			);
		}
		
		void squash_d(MatrixSlice x, MatrixSlice y, MatrixSlice z) {
			launch_kernel(kernel_squash_d, x.rows()*x.cols())(
				x.begin(), y.begin(), x.rows()*x.cols()
			);
		}
		
		void psquash_d(MatrixSlice x, MatrixSlice y, MatrixSlice z) {
			launch_kernel(kernel_psquash_d, x.rows()*x.cols())(
				x.begin(), y.begin(), x.rows()*x.cols()
			);
		}
		
		void additive_noise(MatrixSlice x, MatrixSlice y) {
			launch_kernel(kernel_squash, x.rows()*x.cols())(
				x.begin(), y.begin(), x.rows()*x.cols()
			);
		}
		
		void adadelta(
				MatrixSlice W, MatrixSlice g, MatrixSlice in,
				MatrixSlice g_sq, MatrixSlice d_sq
		) {
			launch_kernel(kernel_adadelta, W.rows()*W.cols())(
				W.begin(), g.begin(), 
	void ewlt(float a, MatrixSlice x, float b, MatrixSlice y);in.begin(),
				g_sq.begin(), d_sq.begi(), W.rows()*W.cols()
			);
		}
	#endif
}
