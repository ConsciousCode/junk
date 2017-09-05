#include "battle/enemy.hpp"

Enemy::~Enemy(){
	
}

void Enemy::act(BattleManager* bm,unsigned x,unsigned y){
	bm=nullptr;
	x+=0;
	y+=0;
}

void Enemy::combat_render(sf::RenderTarget* rt,unsigned x,unsigned y){
	 sf::CircleShape shape{24};
	shape.setFillColor(sf::Color::Red);
	shape.setPosition(x+3,y+3);
	
	rt->draw(shape);
}
