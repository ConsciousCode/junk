#ifndef GAME_GRAPHICS_MENU

#include <SFML/Graphics.hpp>

/**
 * Handles the look and feel of all menus.
**/
class GraphicalMenu:public sf::Drawable{
	private:
		sf::RectangleShape g_rect;
		
	public:
		GraphicalMenu();
		
		void draw(sf::RenderTarget& target,sf::RenderStates states) const;
};

#endif
