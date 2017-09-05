#include "battle/battle-manager.hpp"

BattleManager::BattleManager(){
	board.push_back({new Player(),0,0});
	board.push_back({new Enemy(),(WIDTH-1)*GRIDW,(HEIGHT-1)*GRIDH});
}

GameState* input(InputManager* in){
	battle->input(this,in);
}

GameState* update(Game* game,sf::Time time){
	battle->update(game,this,time);
}

void render(sf::RenderTarget* rt){
	battle->render(rt);
}

unsigned BattleManager::getWidth() const{
	return WIDTH;
}

unsigned BattleManager::getHeight() const{
	return HEIGHT;
}

CombatUnit* BattleManager::get(unsigned x,unsigned y) const{
	for(auto& v: board){
		if(v.x==x && v.y==y){
			return v.unit;
		}
	}
	
	return nullptr;
}

void BattleManager::move(CombatUnit* unit,unsigned x,unsigned y){
	for(auto& v: board){
		if(v.unit==unit){
			v.x=x;
			v.y=y;
		}
	}
}

void BattleManager::next_turn(){
	turn=(turn+1)%board.size();
	if(turn==0){
		battle->round_start(this);
	}
	battle->turn_start(this,get_current_turn());
}

CombatUnit* BattleManager::get_current_turn() const{
	return board[turn].unit;
}
