#ifndef LINEAR_ALGEBRA_HPP
#define LINEAR_ALGEBRA_HPP

#define USE_CUDA 1

namespace la {
	/**
	 * Struct used for coordinating slices of matrices. It has a copy of the
	 *  device data pointer but does not own it.
	 * 
	 * Note: May not be necessary?
	**/
	struct MatrixSlice {
		/**
		 * The device data pointer.
		**/
		float* dev_data;
		
		/**
		 * Offset used for slicing outputs, normally 0
		**/
		unsigned offr, offc;
		
		/**
		 * The actual row and column dimensionality of the matrix.
		**/
		unsigned r, c;
		
		/**
		 * The start and ending row indices.
		**/
		unsigned r0, r1;
		
		/**
		 * The start and ending column indices.
		**/
		unsigned c0, c1;
		
		/**
		 * Whether or not the slice is transposed (applied last).
		**/
		bool transposed;
		
		MatrixSlice();
		MatrixSlice(const MatrixSlice& ms);
		
		/**
		 * Get a pointer to the first element of the slice. If at == true,
		 *  apply the transpose (if applicable) because it's being used as
		 *  a vector.
		**/
		float* begin(bool at=false);
		
		/**
		 * Get the amount to increment by assuming this is a vector.
		**/
		unsigned get_incr();
		
		/**
		 * Get the rows of the slice.
		**/
		unsigned rows();
		
		/**
		 * Get the columns of the slice.
		**/
		unsigned cols();
		
		/**
		 * Return this slice, but transposed.
		**/
		MatrixSlice& T();
		
		/**
		 * Copy data from the given slice.
		**/
		void copy(MatrixSlice x);
		
		MatrixSlice slice(unsigned r0, unsigned r1);
		MatrixSlice slice(unsigned r0, unsigned r1, unsigned c0, unsigned c1);
		
		MatrixSlice offset(unsigned y, unsigned x);
	};
	
	/**
	 * Handles memory and operations on matrices, accelerated by the GPU
	 *  (if available).
	**/
	struct Matrix {
		/**
		 * Row and column dimensionality.
		**/
		unsigned rows, cols;
		
		/**
		 * Pointer to the data on the device side.
		**/
		float* dev_data;
		
		/**
		 * Pointer to the host on the host side (set on demand).
		**/
		float* host_data;
		
		Matrix();
		
		~Matrix();
		
		/**
		 * Allocate the space for the matrix. The matrix is not valid until
		 *  this is called.
		**/
		void alloc(unsigned r, unsigned c);
		
		/**
		 * Fill the matrix with the given value.
		**/
		void fill(float v);
		
		/**
		 * Fetch data from the device to be read on the host. Matrix owns the
		 *  returned pointer.
		**/
		float* fetch();
		
		/**
		 * Fetch data from the device and put it in the given pointer.
		**/
		void fetch(float* f);
		
		/**
		 * Push the given data to the device. The caller owns the given pointer.
		**/
		void push(float* d);
		
		/**
		 * Return a matrix slice encompassing the whole matrix.
		**/
		MatrixSlice slice();
		
		MatrixSlice slice(unsigned r0, unsigned r1);
		MatrixSlice slice(unsigned r0, unsigned r1, unsigned c0, unsigned c1);
	};
	
	/**
	 * B = aA.x + bB
	**/
	void gemv(float a, MatrixSlice A, MatrixSlice x, float b, MatrixSlice B);
	
	/**
	 * C = aA.B + bC
	**/
	void gemm(float a, MatrixSlice A, MatrixSlice B, float b, MatrixSlice C);
	
	/**
	 * C = aA + bB
	**/
	void geam(float a, MatrixSlice A, float b, MatrixSlice B, MatrixSlice C);
	
	/**
	 * B = aA + x
	**/
	void axpy(float a, MatrixSlice A, MatrixSlice x, MatrixSlice B);
	
	/**
	 * y = umx + vb
	**/
	void mxpb(
		float u, MatrixSlice m, MatrixSlice x,
		float vk, MatrixSlice b, MatrixSlice y
	);
	
	/**
	 * y = ax + b
	**/
	void ewlt(float a, MatrixSlice x, float b, MatrixSlice y);
	
	/**
	 * y = x/(1 + abs(x))
	**/
	void squash(MatrixSlice x, MatrixSlice y);
	
	/**
	 * y = x/(2 + abs(x)) + 0.5
	**/
	void psquash(MatrixSlice x, MatrixSlice y);
	
	/**
	 * Z = x*squash_d(y)
	**/
	void squash_d(MatrixSlice x, MatrixSlice y, MatrixSlice z);
	
	/**
	 * Z = x*psquash_d(y)
	**/
	void psquash_d(MatrixSlice x, MatrixSlice y, MatrixSlice z);
	
	/**
	 * y = (15x + normal(0, 1))/16
	**/
	void additive_noise(MatrixSlice x, MatrixSlice y);
	
	/**
	 * Update W using adadelta and the given parameters.
	**/
	void adadelta(
		MatrixSlice W,
		MatrixSlice g, MatrixSlice in,
		MatrixSlice g_sq, MatrixSlice d_sq
	);
}

#endif
