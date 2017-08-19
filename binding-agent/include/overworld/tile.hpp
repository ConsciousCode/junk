#ifndef GAME_TILE_MANAGER
#define GAME_TILE_MANAGER

#include <SFML/Graphics.hpp>

/**
 * Class for managing tile rendering and interaction.
**/
class TileManager{
	protected:
		/**
		 * The entire tileset loaded as a single texture.
		**/
		sf::Texture tileset;
		
		/**
		 * A cached sprite structure for rendering tiles.
		**/
		sf::Sprite tile;
	public:
		enum Collision{
			NONE=0,BLOCK=1,
			TOPLEFT,TOPRIGHT,BOTLEFT,BOTRIGHT
		};
		
		/**
		 * The number of loaded tiles.
		**/
		unsigned numtiles;
		
		TileManager();
		
		/**
		 * Render a tile with the given tile id and coordinates to the given
		 *  render texture.
		**/
		void render(unsigned short id,int x,int y,sf::RenderTarget* out);
		
		/**
		 * Modify the given displacements according to the given collision
		 *  rule and initial coordinates.
		**/
		//void collide(float x,float y,float* dx,float* dy,Collision ct);
};

#endif
