#include "qortex/qortex.hpp"

#include <sndfile.h>
#include <dirent.h>

#include <vector>
#include <string>
#include <cmath>

using namespace Q;

#define frame 1
#define feat1 256
#define feat2 128
#define feat3 32
#define batch 1

int main() {
	Cell cell;
	cell.load("voice.Q");
	cell.clear();
	
	SF_INFO info;
	SNDFILE* inf = sf_open("audio/Warning - Goat Marriage_232266421_soundcloud.wav", SFM_READ, &info);
	
	SNDFILE* outf = sf_open("test.wav", SFM_WRITE, &info);
	if(!outf) {
		throw std::runtime_error(sf_strerror(NULL));
	}
	
	Batch b(frame, 1);
	Batch n(frame, 1);
	float err = 0;
	int epoch = 0;
	
	sf_read_float(inf, b.data(), frame);
	while(sf_read_float(inf, n.data(), frame)/frame) {
		Batch out = cell.run(b);
		
		Batch diff = n - out;
		
		sf_write_float(outf, out.data(), frame);
		
		//std::cout << out << std::endl;
		err = 0.95*err + 0.5*sqrt((diff.array()*diff.array()).sum());
		
		b = n;
		
		if(++epoch%1024 == 0) {
			printf("%f\n", err);
		}
	}
	
	sf_close(inf);
	sf_close(outf);
}
