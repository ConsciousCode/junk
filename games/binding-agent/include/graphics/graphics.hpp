#ifndef GAME_GRAPHICS
#define GAME_GRAPHICS

#include <SFML/Graphics.hpp>

/**
 * Abstraction for sf::RenderTarget to decouple SFML's naming scheme from the
 *  rest of the engine. This is used as a black box wrapper around rendering
 *  engine specific values which are passed to code that knows the interface,
 *  enabling changes to the rendering engine to affect only the Game and
 *  graphics objects.
**/
class Graphics{
	private:
		/**
		 * The value(s) wrapped by Graphics
		**/
		sf::RenderTarget& target;
	public:
		Graphics(sf::RenderTarget& t);
		
		sf::RenderTarget& unwrap();
};

#endif
