#include <cstdio>

#include "qortex.hpp"

void test(Q::Brain<float>& brain, bool a, bool b) {
	Q::Vector<float> inp = Q::Vector<float>::Zero(2, 1);
	inp << a, b;
	
	auto out = brain.process(inp);
	
	printf("%d, %d => %f", (int)a, (int)b, out(0));
	
	brain.learn(inp, out.array() - (a^b));
}

int main() {
	Q::Brain<float> brain;
	
	brain.randomize(2, 1, 0);
	
	for(;;) {
		test(brain, 0, 0);
		test(brain, 0, 1);
		test(brain, 1, 0);
		test(brain, 1, 1);
	}
}

