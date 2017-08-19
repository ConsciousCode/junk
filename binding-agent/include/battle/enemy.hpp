#ifndef GAME_ENEMY
#define GAME_ENEMY

#include <SFML/Graphics.hpp>
#include <SFML/System.hpp>

#include "battle/combat-unit.hpp"
#include "battle/battle.hpp"

class Enemy:public CombatUnit{
	public:
		~Enemy();
		
		void act(BattleManager* bm,unsigned x,unsigned y);
		
		void combat_render(sf::RenderTarget* rt,unsigned x,unsigned y);
};

#endif
