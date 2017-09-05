#include <iostream>

#include "qortex.hpp"

using namespace Q;

int main() {
	Cell cell;
	cell.add(
		new Transform(2, "middle"),
		new Transform(1, "end")
	);
	cell.build(2);
	
	Batch in(2, 4);
	in <<
		-1, -1, 1, 1,
		-1, 1, -1, 1;
	
	Batch t(1, 4);
	t << -1, 1, 1, -1;
	
	int epoch = 0;
	while(true) {
		auto p = cell.prepare(in);
		cell.train(t - p);
		
		if(++epoch%1024 == 0) {
			std::cout << cell.run(in) << std::endl;
		}
	}
}
