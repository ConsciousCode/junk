#include "qortex/qortex.hpp"

#include <sndfile.h>

using namespace Q;

/*
std::vector<std::string> ls(const std::string& root) {
	std::vector<std::string> dir;
	DIR* d = opendir(root.c_str());
	dirent* dp;
	
	while(dp = readdir(d)) {
		dir.push_back(dp->d_name);
	}
	
	closedir(d);
	
	return dir;
}
*/

#define frame 2
#define features 256
#define batch 4096

int main() {
	short buffer[frame*batch];
	/*
	auto files = ls("audio");
	std::random_shuffle(files.begin(), files.end());
	*/
	
	Cell cell;
	
	cell.add(
		new Sequencer(features, "encoder"),
		new Noise("noise"),
		new Sequencer(frame, "decoder")
	);
	cell.build(frame);
	
	SF_INFO info;
	int n;
	SNDFILE* sf = sf_open(
		"audio/Warning - Goat Marriage_232266421_soundcloud.wav",
		SFM_READ, &info
	);
	SNDFILE* outf = sf_open("test.wav", SFM_WRITE, &info);
	Batch b(frame, batch);
	
	while(n = sf_read_float(sf, b.data(), frame*batch)) {
		b.resize(frame, n);
		
		Batch out = cell.run(b);
		
		sf_write_float(outf, out.data(), n);
	}
}
