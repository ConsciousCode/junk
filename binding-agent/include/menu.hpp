#ifndef GAME_MENU
#define GAME_MENU

#include <SFML/Graphics.hpp>
#include <SFML/System.hpp>

#include "graphics/menu.hpp"

/**
 * The base class for all menus.
**/
class Menu{
	private:
		/**
		 * The background used by all menus.
		**/
		GraphicalMenu g_menu_bg;
		
		/**
		 * The time of the last update.
		**/
		sf::Time last;
		
	public:
		Menu();
		
		~Menu();
		
		/**
		 * Update the menu.
		**/
		virtual void update(sf::Time t)=0;
		
		/**
		 * Render the menu.
		**/
		virtual void render(sf::RenderTarget* rt);
};

#endif
