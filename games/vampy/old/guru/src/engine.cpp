#include "engine.hpp"

Engine::Engine(int w, int h, const char* title, int fps) {
	window.setVisible(false);
	window.setActive(false);
	window.create(sf::VideoMode(w, h), title);
	window.setFramerateLimit(fps);
	
	root = nullptr;
	running = true;
}

void Engine::stop() {
	running = false;
}

void Engine::show() {
	window.setVisible(true);
	window.setActive(true);
}

void Engine::update(sf::Time dt) {
	sf::Event ev;
	
	while(window.pollEvent(ev) && running) {
		switch(ev.type) {
			case sf::Event::Closed:
				window.close();
				break;
			
			default:
				input.process(ev);
		}
	}
}

void Engine::start() {
	sf::Clock clock;
	dprint(DEBUG_INIT, "Engine, start!");
	while(window.isOpen() && running) {
		sf::Time dt = clock.restart();
		update(dt);
		
		window.clear();
		
		root->act(*this, dt);
		root->draw(window);
		
		window.display();
	}
	
	dprint(DEBUG_INIT, "Window destroyed");
}

