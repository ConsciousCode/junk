#include "qortex.hpp"

int main(int argc, char* argv[]) {
	if(argc == 1) {
		printf("pcell <file>\n");
	}
	else {
		Q::Cell cell;
		FILE* f = fopen(argv[1], "rb");
		if(f) {
			cell.load(f);
			cell.print();
			
			fclose(f);
		}
	}
}
