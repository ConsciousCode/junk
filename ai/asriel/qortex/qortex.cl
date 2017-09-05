#define RHO 0.95
#define EPS 1e-6

int getpos(int r, int c, int z) {
	return c*z + r;
}

float sqr(float v) {
	return v*v;
}

float activate(float v, int act) {
	switch(act) {
		//squash
		case 1:
			return v/(1 + fabs(v));
		//psquash
		case 2:
			return v/(1 + 2*fabs(v));
		case 0:
		default:
			return v;
	}
}

float activate_d(float v, int act) {
	switch(act) {
		//squash
		case 1:
			return 1/sqr(1 + v);
		//psquash
		case 2:
			return 1/sqr(1 + 2*v);
		case 0:
		default:
			return v;
	}
}

kernel void adadelta(
	global float* Wb, global float* in, global float* grad,
	constant int r, constant int c,
	global float* g_sq, global float* d_sq, constant int act
	
) {
	int tr = get_global_id(0), tc = get_global_id(1), id = getpos(tr, tc, r);
	float g;
	
	if(id >= r*c) {
		return;
	}
	
	//Account for bias, in treated as 1
	if(tc == c - 1) {
		g = grad[tr];
	}
	else {
		g = in[tc]*grad[tr];
	}
	
	g = activate(g, act);
	
	//Running average of g^2
	g_sq[id] = RHO*g_sq[id] + (1 - RHO)*g*g;
	
	/*
	//Natural way of thinking about it
	float d =
		sqrt(d_sq[id] + EPS)/
		sqrt(g_sq[id] + EPS)*g;
	*/
	//Optimization using the reciprocal of sqrt hack
	float d =
		rsqrt(g_sq[id] + EPS)/
		rsqrt(d_sq[id] + EPS)*g;
	
	//Running average of dW^2
	d_sq[id] = RHO*d_sq[id] + (1 - RHO)*d*d;
	
	Wb[id] -= d;
}

kernel void transform(
		global float* Wb, int r, int c,
		global float* input, global float* output, int act
) {
	int tr = get_global_id(0), tc = get_global_id(1);
	
	float val = Wb[getpos(tr, tc - 1, r)];
	for(int k = 0; k < c; ++k) {
		val += Wb[getpos(tr, k, r)]*input[getpos(k, tc, r)];
	}
	
	output[getpos(tr, tc, r)] = activate(val, act);
}

kernel void transform_grad(
		global float* Wb, int r, int c,
		global float* grad, global float* output, int act
) {
	int tr = get_global_id(0), tc = get_global_id(1);
	
	if(getpos(tr, tc, r) >= r*(c - 1)) {
		return;
	}
	
	float val = 0;
	for(int k = 0; k < r; ++k) {
		//Note: Wb is transposed
		val += Wb[getpos(k, tr, r)]*grad[getpos(k, tc, r)];
	}
	
	output[getpos(tr, tc, r)] = activate_d(val, act);
}

/**
 * c = a - b
**/
kernel void dif(global float* a, global float* b, global float* c, int size) {
	int i;
	
	//Speed up the first part by using 
	for(i = 0; i < size/16; ++i) {
		((float16*)c)[i] = ((float16*)a)[i] - ((float16*)b)[i];
	}
	
	for(i *= 16; i < size; ++i) {
		c[i] = a[i] - b[i];
	}
}

/**
 * returns sum((a - b)^2), used for calculating the MSE
**/
kernel float dif_sq_sum(global float* a, global float* b, int size) {
	union {
		float16 f16;
		float8 f8[2];
		float4 f4[4];
		float2 f2[8];
		float f1[16];
	} = {0};
	int i;
	
	for(i = 0; i < size/16; ++i) {
		float16 t = ((float16*)a)[i] - ((float16*)b)[i];
		f16 += t*t;
	}
	
	size %= 16;
	f8[0] += f8[1];
	for(i *= 2; i < size/8; ++i) {
		float8 t = ((float8*)a)[i] - ((float8*)b)[i];
		f8[0] += t*t;
	}
	
	size %= 8;
	f4[0] += f4[1];
	for(i *= 2; i < size/4; ++i) {
		float4 t = ((float4*)a)[i] - ((float4*)b)[i];
		f4[0] += t*t;
	}
	
	i *= 2;
	
	//Looping now would be wasteful, just add the last few cases
	float res = f1[0] + f1[1] + f1[2] + f1[3];
	switch(size%4) {
		case 3:
			res += sqr(a[i + 2] - b[i + 2]);
		case 2:
			res += sqr(a[i + 1] - b[i + 1]);
		case 1:
			res += sqr(a[i] - b[i]);
		case 0:
			break;
	}
	
	return res;
}
