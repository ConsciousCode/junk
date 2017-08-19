#ifndef GAME_BATTLE_MANAGER
#define GAME_BATTLE_MANAGER

#include <SFML/Graphics.hpp>
#include "game-state.hpp"

class Game;
class InputManager;
class Battle;
class CombatUnit;

/**
 * Manages the fundamental parts of battle.
**/
class BattleManager:public GameState{
	public:
		/**
		 * The width and height of the battle grid.
		**/
		static const unsigned WIDTH=9,HEIGHT=9;
		
		/**
		 * Upper-left corner of the grid.
		**/
		static const unsigned GRIDX=1,GRIDY=1;
		
		/**
		 * Size of the grid blocks.
		**/
		static const unsigned GRIDW=32,GRIDH=32;
		
	private:
		/**
		 * An entry into the battle grid.
		**/
		struct Entry{
			/**
			 * The combatant.
			**/
			CombatUnit* unit;
			
			/**
			 * Its position in the battle grid.
			**/
			unsigned x,y;
		};
		
		/**
		 * A list of battle grid entries in turn order
		**/
		std::vector<Entry> board;
		
		/**
		 * The index of the combatant whose turn is currently being done.
		**/
		unsigned turn;
		
		G_BattleManager gbm;
		
		Battle* battle;
	public:
		BattleManager();
		
		virtual GameState* input(InputManager* in);
		
		/**
		 * Update the battle data based on the elapsed time.
		**/
		virtual GameState* update(Game* game,sf::Time time);
		
		/**
		 * Render the battle.
		**/
		virtual void render(sf::RenderTarget* rt);
		
		/**
		 * Get the width of the arena.
		**/
		unsigned getWidth() const;
		
		/**
		 * Get the height of the arena.
		**/
		unsigned getHeight() const;
		
		/**
		 * Get the combat unit at the given location.
		**/
		CombatUnit* get(unsigned x,unsigned y) const;
		
		/**
		 * Move the given combat unit to the given location.
		**/
		void move(CombatUnit* unit,unsigned x,unsigned y);
		
		/**
		 * Go to the next turn.
		**/
		void next_turn();
		
		/**
		 * Get the combat unit which is currently taking its turn.
		**/
		CombatUnit* get_current_turn() const;
};

#endif
