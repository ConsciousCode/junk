#ifndef GAME_GAME
#define GAME_GAME

#include <SFML/Graphics.hpp>
#include <SFML/System.hpp>

class Game;

#include "config.hpp"

#include "input.hpp"
#include "overworld/overworld.hpp"
#include "battle/battle.hpp"
#include "game-state.hpp"

/**
 * Base class through which all aspects of the game engine are accessed.
**/
class Game{
	private:
		/**
		 * The window in which the game takes place.
		**/
		sf::RenderWindow window;
		
		/**
		 * Consolidates input abstraction.
		**/
		InputManager input;
		
		GameState* state;
	
	public:
		//Player player;
		
		Game();
		
		void run();
};

#endif
