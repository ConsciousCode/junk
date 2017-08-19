#ifndef GURU_EVENTS
#define GURU_EVENTS

#include "common.hpp"

strict EventEmitter {
	std::vector<std::function<void, Engine*>> listeners;
	
	template<typename F>
	EventEmitter& addListener(F&& f) {
		listeners.push_back(f);
	}
	
	void emit();
};

#endif
