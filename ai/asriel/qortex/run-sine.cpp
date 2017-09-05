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
	SF_INFO info = {0, (int)RATE, 1, SF_FORMAT_WAV|SF_FORMAT_PCM_U8, 0, 0};
	
	{
		SNDFILE* snd = sf_open("ideal.wav", SFM_WRITE, &info);
		
		for(int i = 0; i < RATE*2; ++i) {
			float f = tone(i);
			sf_write_float(snd, &f, 1);
		}
		sf_close(snd);
	}
	
	srand(time(0));
	
	Cell cell;
	/*
	cell.add(
		//new Noise(),
		new Sequencer(1)
		//new Transform(1)
	);
	cell.build(1);
	/*/
	cell.load("sine.Q");
	//cell.clear();
	((Noise*)cell.find("noise"))->active = false;
	//*/
	
	cell.print();
	
	SNDFILE* snd = sf_open("test.wav", SFM_WRITE, &info);
	if(!snd) {
		printf("%s\n", sf_strerror(NULL));
		return 1;
	}
	
	Batch b(1, 1);
	float f = 0;
	
	/*
	for(int i = 0; i < RATE; ++i) {
		b(0, 0) = tone(i);
		sf_write_float(snd, &f, 1);
		f = cell.run(b)(0, 0);
	}
	*/
	
	for(int i = 0; i < RATE; ++i) {
		b(0, 0) = f;
		sf_write_float(snd, &f, 1);
		f = cell.run(b)(0, 0);
	}
	
	sf_close(snd);
}
