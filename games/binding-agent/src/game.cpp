#include "game.hpp"

Game::Game():window{sf::VideoMode(WINW,WINH),"Title"}{
	window.clear(sf::Color::Black);
	
	Service::provide(input);
	
	/*
	FILE* f=fopen("data/test.map","rb");
	overworld.enterMap(new Map(f));
	fclose(f);
	*/
	
	state=&battle;
}

void Game::run(){
	sf::Clock clock;
	
	window.clear();
	
	while(window.isOpen()){
		sf::Event event;
		
		while(window.pollEvent(event)){
			input.handle(event);
			
			switch(event.type){
				case sf::Event::Closed:
					window.close();
					break;
				default:
					break;
			}
		}
		
		sf::Time elapsed=clock.getElapsedTime();
		clock.restart();
		
		GameState* ns=state->update(*this,elapsed.asMilliseconds());
		if(ns){
			state=ns;
		}
		state->render(window);
		
		window.display();
		
		elapsed=clock.getElapsedTime();
		clock.restart();
		sf::sleep(sf::milliseconds(1000/60.0)-elapsed);
	}
}
