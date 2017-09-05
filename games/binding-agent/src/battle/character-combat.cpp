#include "CharacterCombat.hpp"

CharacterCombat::CharacterCombat(){
	
}

CharacterCombat::~CharacterCombat(){
	
}

void CharacterCombat::move(float x,float y,sf::Time frame){
	float pxperframe=SPEED*frame.asMilliseconds();
	sprite.move(x*pxperframe,y*pxperframe);
}

void CharacterCombat::act(BattleManager* bm,unsigned x,unsigned y){
	bm->CharacterCombat_turn(this,x,y);
}

void CharacterCombat::render(sf::RenderTarget* rt,unsigned x,unsigned y){
	sf::CircleShape shape{24};
	shape.setFillColor(sf::Color::Green);
	shape.setPosition(x+3,y+3);
	
	rt->draw(shape);
}
