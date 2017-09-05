#ifndef GAME_OVERWORLD
#define GAME_OVERWORLD

#include <vector>
#include <SFML/System.hpp>

class OverworldManager;

class Game;

#include "map.hpp"

#include "tile.hpp"

/**
 * Manager for the overworld mode.
**/
class OverworldManager{
	protected:
		/**
		 * The currently loaded map.
		**/
		Map* cur=nullptr;
		
		/**
		 * Vector of loaded maps which are 2 rooms away from the currently
		 *  loaded map.
		**/
		std::vector<Map*> maps;
		/**
		 * The current x and y coordinates.
		**/
		float viewx=0,viewy=0;
		
		/**
		 * Tile manager separates tile management from overworld management.
		**/
		TileManager tm;
		
		/**
		 * Cached texture of the tiles in the viewport.
		**/
		sf::RenderTexture tile_cache;
		
		/**
		 * Cached sprite structure for tile_cache.
		**/
		sf::Sprite renderable_tile_cache;
		
		/**
		 * Player spritesheet loaded as a texture.
		**/
		sf::Texture player_spritesheet;
		
		/**
		 * Sprite for rendering the player.
		**/
		sf::Sprite player_sprite;
		
		/**
		 * Speed of overworld moving in pixels per millisecond.
		**/
		static constexpr float SPEED=128.0/1000.0;
	public:
		OverworldManager();
		
		~OverworldManager();
		
		/**
		 * Draw the overworld - no-op if nothing has happened.
		**/
		void render(sf::RenderWindow* rw);
		
		/**
		 * Enter the given map.
		**/
		void enterMap(Map* map);
		
		/**
		 * Update the state for the current game tick
		**/
		void update(Game* game,sf::Time frame);
		
		/**
		 * Update the cache for prerendered tile textures based on the given
		 *  change in viewport coordinates.
		**/
		void update_tilecache();
};

#endif
