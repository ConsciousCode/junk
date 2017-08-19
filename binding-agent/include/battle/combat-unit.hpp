#ifndef GAME_BATTLE_COMBAT_UNIT
#define GAME_BATTLE_COMBATANT

#include "graphics/graphics.hpp"

class BattleManager;

/**
 * A generic entity that occupies a cell of the battle grid.
**/
class CombatUnit{
	public:
		virtual ~CombatUnit();
		
		/**
		 * It's the Combatant's turn, ask it to do something.
		**/
		virtual void act(BattleManager* bm,unsigned x,unsigned y)=0;
		
		/**
		 * Render the combatant on the battlefield.
		**/
		virtual void combat_render(
			Graphics& g,unsigned x,unsigned y
		)=0;
};

#endif
