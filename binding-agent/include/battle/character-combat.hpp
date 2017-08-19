#ifndef GAME_CharacterCombat
#define GAME_CharacterCombat

#include <SFML/Graphics.hpp>
#include <SFML/System.hpp>

#include "battle/combat-unit.hpp"
#include "battle/battle.hpp"

/**
 * Component class for managing the combat of a character.
**/
class CharacterCombat:public CombatUnit{
	private:
		PartyCombat* sm;
		sf::Sprite sprite;
	public:
		static constexpr double SPEED=128.0/1000.0;
		
		CharacterCombat();
		
		~CharacterCombat();
		
		/**
		 * Move in the given direction. x and y should be [-1,1] generally,
		 *  multiplied by the CharacterCombat speed.
		**/
		void move(float x,float y,sf::Time frame);
		
		/**
		 * Take the character's turn.
		**/
		void act(BattleManager* bm,unsigned x,unsigned y);
		
		/**
		 * Render the character in the given position.
		**/
		void render(sf::RenderTarget* rt,unsigned x,unsigned y);
		
		
};

#endif
