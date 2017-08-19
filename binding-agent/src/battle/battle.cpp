#include "battle/battle.hpp"

#include "game.hpp"
#include "battle-manager.hpp"

#include "player.hpp"
#include "battle/enemy.hpp"

void Battle::input(BattleManager* bm,InputManager* in){
	bm->get_current_turn()->getManager()->input(bm,in);
}

void Battle::update(Game* game,BattleManager* bm,sf::Time time){
	bm->get_current_turn()->getManager()->update(game,bm,time);
}

void Battle::render(sf::RenderTarget* rt){
	gbm.render(rt);
	
	for(auto v: board){
		v.combatant->combat_render(rt,v.x,v.y);
	}
}

void Battle::round_start(BattleManager* bm){
	bm=bm;
}

void Battle::turn_start(BattleManager* bm,CombatUnit* unit){
	bm=bm;
	unit=unit;
}
