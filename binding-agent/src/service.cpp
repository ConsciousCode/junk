#include "service.hpp"

#include <cassert>

Input& Service::input(){
	assert(input_service!=nullptr);
	
	return *input_service;
}

void Service::provide(Input& in){
	input_service=&in;
}
