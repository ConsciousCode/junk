#ifndef GAME_STATE
#define GAME_STATE

#include <SFML/Graphics.hpp>

class GameState;
class Game;
class Graphics;

/**
 * An abstract state for the game.
**/
class GameState{
	public:
		/**
		 * Handle an update frame, return the next state or null.
		**/
		virtual GameState* update(Game& g)=0;
		
		/**
		 * Render the game state onto the given render target.
		**/
		virtual void render(Graphics& rt)=0;
};

#endif
