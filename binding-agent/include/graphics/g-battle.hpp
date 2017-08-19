#ifndef GRAPHICS_BATTLE
#define GRAPHICS_BATTLE

#include <SFML/Graphics.hpp>

/**
 * Graphical manager for Battle
**/
class G_Battle{
	private:
		/**
		 * Vertex array for drawing the grid.
		**/
		sf::VertexArray grid_verts;
		
		/**
		 * Rectangle to surround the grid.
		**/
		sf::RectangleShape grid_rect;
	public:
		G_Battle();
		
		/**
		 * Render the battle.
		**/
		void render(sf::RenderTarget* rt);
};

#endif
