#include "input.hpp"
#include "debug.hpp"

#include "keymap.cc"

bool Keyboard::bind(const std::string& n, const std::string& b) {
	auto k = name_key(n);
	if(k == sf::Keyboard::Unknown) {
		return false;
	}
	
	dprint(DEBUG_INIT, "Binding key ", n, " to ", b);
	
	bindings[k] = b;
	
	return true;
}

void Keyboard::process(InputManager& in, const sf::Event& ev) {
	bool value;
	if(ev.type == sf::Event::KeyPressed) {
		value = true;
	}
	else if(ev.type == sf::Event::KeyReleased) {
		value = false;
	}
	else {
		return;
	}
	
	auto it = bindings.find(ev.key.code);
	if(it == bindings.end()) {
		return;
	}
	
	auto bit = in.button.find(it->second);
	if(bit != in.button.end()) {
		if(bit->second != value) {
			dprint(DEBUG_INPUT, key_name(ev.key.code), value? "+" : "-");
		}
		bit->second = value;
		return;
	}
	
	auto rit = in.range.find(it->second);
	if(rit != in.range.end()) {
		if(rit->second != value) {
			dprint(DEBUG_INPUT, key_name(ev.key.code), " = ", value);
		}
		rit->second = value;
		return;
	}
	
	dprint(DEBUG_INPUT, key_name(ev.key.code), " is not bound to anything");
}

void InputManager::addSource(IInputSource* iis) {
	dprint(DEBUG_INIT, "Adding input source");
	sources.push_back(iis);
}

void InputManager::process(const sf::Event& ev) {
	for(auto v : sources) {
		v->process(*this, ev);
	}
}

bool InputManager::bind(const std::string& n, const std::string& b) {
	for(auto v : sources) {
		if(v->bind(n, b)) {
			return true;
		}
	}
	
	dprint(DEBUG_WARNING, "Binding ", n, " to ", b, " failed");
	
	return false;
}

