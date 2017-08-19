#ifndef GAME_BATTLE
#define GAME_BATTLE

#include <vector>

#include <SFML/Graphics.hpp>
#include <SFML/System.hpp>

#include "battle/combat-unit.hpp"
#include "graphics/g-battle.hpp"

class Game;

/**
 * Implement the flexible parts of the battle system.
**/
class Battle:public GameState{
	public:
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
		virtual unsigned getWidth() const;
		
		/**
		 * Get the height of the arena.
		**/
		virtual unsigned getHeight() const;
		
		/**
		 * Return whether or not the given position is "available" (e.g. it
		 *  has something in it or not.
		**/
		virtual bool available(unsigned x,unsigned y) const;
		
		/**
		 * Return whether or not the given position is valid.
		**/
		virtual bool valid(unsigned x,unsigned y) const;
		
		/**
		 * Get the combat unit at the given location.
		**/
		void attack(unsigned x,unsigned y,Attack& attack);
		
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
	public:
		/**
		 * Process inputs separately from updates.
		**/
		virtual void input(InputManager* in);
		
		/**
		 * Generic frame update method.
		**/
		virtual void update(Game* game,BattleManager* bm,sf::Time time);
		
		/**
		 * Render the battle.
		**/
		virtual void render(sf::RenderTarget* rt);
		
		/**
		 * Do something when a round starts.
		**/
		virtual void round_start(BattleManager* bm);
		
		/**
		 * Do something when a turn starts.
		**/
		virtual void turn_start(BattleManager* bm,CombatUnit* unit);
};

#endif
