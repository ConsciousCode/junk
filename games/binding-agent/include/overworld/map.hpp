#ifndef GAME_MAP
#define GAME_MAP

#include <SFML/Graphics.hpp>

class Map;

/**
 * Manage the map's data structures, including loading from files, enemies,
 *  and rendering. It's intended that multiple maps be loaded at any given
 *  time and fed to the OverworldManager as needed.
 *
 * I think the way this should work is enemies are kept live in the data until
 *  the map is despawned for a more relevant map; loaded maps should probably
 *  make up a taxicab radius of 2 (e.g. all rooms that are 2 away are loaded).
 *  This should enable seamless room loading while keeping memory usage low.
**/
class Map{
	protected:
		/**
		 * Flattened 2D array of tile ids
		**/
		unsigned* data;
		
		/**
		 * The areas along the edge of the map which the player can exit from.
		**/
		
		/**
		 * Menus associated with the map.
		**/
		//Menu** menus;
	public:
		/**
		 * The width and height of the map in tiles
		**/
		unsigned width,height;
		
		/**
		 * Load the map from a file
		**/
		Map(FILE* f);
		
		~Map();
		
		/**
		 * Get the tile at the given position
		**/
		unsigned short get(int x,int y);
		
		/**
		 * Set the tile at the given position.
		**/
		void set(int x,int y,unsigned short id);
};

#endif
