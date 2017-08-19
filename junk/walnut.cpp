#include "walnut.hpp"

template<typename R, typename U, typename V>
constexpr R min(U u, V v) {
	return u < v? u : v;
}

void Brain::process(int8_t* x, int8_t* m, int8_t* y) {
	int8_t* W = RZ_Y;
	
	/*
	 Interlacing R[I + M, M], Z[I + M, M], Y[I + M, O]
	*/
	
	int om = min(nout, nmem), i = 0;
	for(; i < om; ++i) {
		int rs = 0, zs = 0, ys = 0;
		
		//Left
		for(int j = 0; j < ninp; ++j) {
			rs += (*(W++))*x[j];
			zs += (*(W++))*x[j];
			ys += (*(W++))*x[j];
		}
		
		//Right
		for(int j = 0; j < nmem; ++j) {
			rs += (*(W++))*m[j];
			zs += (*(W++))*m[j];
			ys += (*(W++))*m[j];
		}
		
		int r = activate(rs), z = activate(zs);
		
		y[i] = activate(ys);
		m[i] = z/(0x80 + (z - 0x80)*r);
	}
	
	if(nmem > nout) {
		for(; i < nmem; ++i) {
			int rs = 0, zs = 0;
			
			for(int j = 0; j < ninp; ++j) {
				rs += (*(W++))*x[j];
				zs += (*(W++))*x[j];
			}
			
			for(int j = 0; j < nmem; ++j) {
				rs += (*(W++))*m[j];
				zs += (*(W++))*m[j];
			}
			
			m[i] = z/(0x80 + (z - 0x80)*r);
		}
	}
	else {
		for(; i < nout; ++i) {
			int ys = 0;
			
			for(int j = 0; j < ninp; ++j) {
				ys += (*(W++))*x[j];
			}
			
			for(int j = 0; j < nmem; ++j) {
				ys += (*(W++))*m[j];
			}
			
			y[i] = activate(ys);
		}
	}
}

void Brain::backward(int8_t* xe, int8_t* ye) {
	int8_t* W = RZ_Y;
	
	int om = min(nout, nmem), i = 0;
	for(; i < om; ++i) {
		int rs = 0, zs = 0, ys = 0;
		
		//Left
		for(int j = 0; j < ninp; ++j) {
			rs += (*(W++))*x[j];
			zs += (*(W++))*x[j];
			ys += (*(W++))*x[j];
		}
		
		//Right
		for(int j = 0; j < nmem; ++j) {
			rs += (*(W++))*m[j];
			zs += (*(W++))*m[j];
			ys += (*(W++))*m[j];
		}
		
		int r = activate(rs), z = activate(zs);
		
		y[i] = activate(ys);
		m[i] = z/(0x80 + (z - 0x80)*r);
	}
	
	if(nmem > nout) {
		for(; i < nmem; ++i) {
			int rs = 0, zs = 0;
			
			for(int j = 0; j < ninp; ++j) {
				rs += (*(W++))*x[j];
				zs += (*(W++))*x[j];
			}
			
			for(int j = 0; j < nmem; ++j) {
				rs += (*(W++))*m[j];
				zs += (*(W++))*m[j];
			}
			
			m[i] = z/(0x80 + (z - 0x80)*r);
		}
	}
	else {
		for(; i < nout; ++i) {
			int ys = 0;
			
			for(int j = 0; j < ninp; ++j) {
				ys += (*(W++))*x[j];
			}
			
			for(int j = 0; j < nmem; ++j) {
				ys += (*(W++))*m[j];
			}
			
			y[i] = activate(ys);
		}
	}
}
