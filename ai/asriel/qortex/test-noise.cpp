#include <iostream>
#include <cmath>

#include <sndfile.h>

#include "qortex.hpp"

using namespace Q;

#define FREQ 220.0
#define RATE 8000.0

int main() {
	srand(time(0));
	
	Cell cell(
		new Noise()
	);
	cell.build(1);
	
	SF_INFO info = {0, (int)RATE, 1, SF_FORMAT_WAV|SF_FORMAT_PCM_U8, 0, 0};
	
	SNDFILE* snd = sf_open("test.wav", SFM_WRITE, &info);
	if(!snd) {
		printf("%s\n", sf_strerror(NULL));
		return 1;
	}
	
	Matrix in;
	float f = 0;
	in.alloc(1, 1);
	
	for(int i = 0; i < RATE; ++i) {
		in.push(&f);
		cell.run(&in);
		in.fetch(&f);
		sf_write_float(snd, &f, 1);
	}
	
	sf_close(snd);
}
