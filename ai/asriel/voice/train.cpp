#include "qortex/qortex.hpp"

#include <sndfile.h>
#include <dirent.h>

#include <vector>
#include <string>
#include <cmath>

using namespace Q;

std::vector<std::string> ls(const std::string& root) {
	std::vector<std::string> dir;
	DIR* d = opendir(root.c_str());
	dirent* dp;
	
	while(dp = readdir(d)) {
		if(dp->d_name[0] != '.') {
			dir.push_back(root + "/" + dp->d_name);
		}
	}
	
	closedir(d);
	
	return dir;
}

#define frame 1
#define feat1 256
#define feat2 128
#define feat3 32
#define batch 1

int main() {
	float buffer[frame*batch];
	
	auto files = ls("audio");
	std::random_shuffle(files.begin(), files.end());
	
	Cell cell;
	cell.add(
		new Simplifier{
			new Sequencer(feat1), new Sequencer(frame),
			new Transform(feat2), new Transform(feat1),
			new Transform(feat3), new Transform(feat2)
		}
	);
	cell.build(frame);
	
	for(std::string f : files) {
		printf("Processing %s\n", f.c_str());
		
		SF_INFO info;
		SNDFILE* sf = sf_open(f.c_str(), SFM_READ, &info);
		
		if(!sf) {
			throw std::runtime_error(sf_strerror(NULL));
		}
		
		Batch b(frame, 1);
		Batch n(frame, 1);
		float err = 0;
		int epoch = 0;
		
		sf_read_float(sf, b.data(), frame);
		while(sf_read_float(sf, n.data(), frame)/frame) {
			Batch diff = n - cell.prepare(b);
			
			cell.train(diff);
			
			err = 0.95*err + 0.5*sqrt((diff.array()*diff.array()).sum());
			
			b = n;
			
			if(++epoch%1024 == 0) {
				printf("%f\n", err);
			}
			
			if(epoch%100000 == 0) {
				printf(
					"Saving... processed %f seconds thus far\n",
					epoch/44100.0
				);
				cell.save("voice.Q");
			}
		}
		
		cell.clear();
	}
}
