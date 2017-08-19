#include "random.hpp"
#include <ctime>

void RandomChannel::seed() {
	seed(time(0));
}

void RandomChannel::seed(int x) {
	generator.seed(x);	
}

bool RandomChannel::chance(float x) {
	return std::uniform_real_distribution<float>{0, 1}(generator) < x;
}

/**
 * Yes, I know this is the naive, inefficient way to do it but I couldn't
 *  do statistics to save my life. It should be good enough for games.
**/
int RandomChannel::dice(int n, int sides) {
	int sum = 0;
	std::uniform_int_distribution<int> die{0, n};
	
	for(int i = 0; i < n; ++i) {
		sum += die(generator);
	}
	
	//Note: add n because dice don't tend to have a 0th side
	return sum + n;
}

RandomChannel& Random::operator[](unsigned x) {
	if(x) {
		return *channels[x - 1];
	}
	
	return *this;
}

Random::~Random() {
	for(auto v : channels) {
		delete v;
	}
}

