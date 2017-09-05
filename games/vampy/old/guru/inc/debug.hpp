#ifndef GURU_DEBUG_HPP
#define GURU_DEBUG_HPP

#define DEBUG_INIT 1
#define DEBUG_ERROR 2
#define DEBUG_WARNING 4
#define DEBUG_INPUT 8

#define DEBUG_CLEAN 16

#define DEBUG_ANY (-1)

#ifdef DEBUG_LEVEL

#include <cstdio>
#include <string>
#include "util/pprint.hpp"

static int last_level = 0;

template<typename... T>
void dprint(int level, T... t) {
	const char* format;
	
	level &= DEBUG_LEVEL;
	
	if(level & DEBUG_INIT) {
		format = " * %s\n";
	}
	else if(level & DEBUG_ERROR) {
		format = "Error: %s\n";
	}
	else if(level & DEBUG_WARNING) {
		format = "Warning: %s\n";
	}
	else if(level & DEBUG_INPUT) {
		format = "%s; ";
	}
	else if(level & DEBUG_CLEAN) {
		format = " ! %s\n";
	}
	else {
		return;
	}
	
	//DEBUG_INPUT is output on the same line to make it less spammy, so we
	// need to give it a newline.
	if((last_level & DEBUG_INPUT) && !(level & DEBUG_INPUT)) {
		putchar('\n');
	}
	last_level = level;
	
	printf(format, pprint<std::string>(t...).c_str());
	
	fflush(stdout);
}

#else

#define dprint(...)

#endif

#endif

