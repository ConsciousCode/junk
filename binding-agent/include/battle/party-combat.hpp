#ifndef PARTY_COMBAT
#define PARTY_COMBAT

#include <vector>

/**
 * State machine to allow for user input to guide action selection.
**/
class PartyCombat{
	private:
		/**
		 * Coordinate class for keeping track of tactical paths.
		**/
		struct Coordinate{
			/**
			 * X and Y components of the coordinate.
			**/
			unsigned x,y;
		};
		
		std::vector<Coordinate> path;
	public:
		bool update(BattleManager* bm
};

#endif
