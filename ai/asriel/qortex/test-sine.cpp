#include <iostream>
#include <cmath>

#include <sndfile.h>

#include "qortex.hpp"

using namespace Q;

#define FREQ 220.0
#define RATE 8000.0

Scalar tone(int t) {
	//return (t%((int)FREQ))/FREQ - 0.5;
	return sin(2*M_PI*FREQ*t/RATE);
}

int main() {
	Cell cell;
	cell.add(
		new Sequencer(4, "timer"),
		new Noise("noise"),
		new Transform(1, "converter")
	);
	cell.build(1);
	
	Batch out(1, 1), next(1, 1);
	
	out(0, 0) = 0;
	
	int t = 0;
	while(true) {
		next(0, 0) = tone(++t);
		
		out = cell.prepare(out);
		cell.train(next - out);
		
		//printf("%f\n", p(0, 0));
		Scalar e = 0.9*e + 0.1*(next - out)(0, 0)*(next - out)(0, 0);
		
		if(t%(int)(RATE/FREQ*12) == 0) {
			std::cout << e << std::endl;
		}
		
		if(t%((int)(RATE/FREQ)*48) == 0) {
			cell.save("sine.Q");
			printf("Saving...\n");
		}
	}
}
