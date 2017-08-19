#include <cmath>

#include "entity.hpp"

sf::Rect<float> Intangible::bounds(Creature* c) const {
	return sf::Rect<float>{};
}

bool Intangible::contains(Creature* c, float x, float y) const {
	return false;
}

BoundingBox::BoundingBox() : offx{0}, offy{0}, bbw{0}, bbh{0} {}

BoundingBox::BoundingBox(float ox, float oy, float bw, float bh) {
	offx = ox;
	offy = oy;
	bbw = bw;
	bbh = bh;
}

sf::Rect<float> BoundingBox::bounds(Creature* c) const {
	return sf::Rect<float>{offx, offy, bbw, bbh};
}

bool BoundingBox::contains(Creature* c, float x, float y) const {
	return x >= offx && x <= offx + bbw && y >= offy && y <= offy + bbh;
}

Creature* Species::generate(float x, float y) {
	Creature* c = new Creature(x, y);
	
	c->species = this;
	c->sprite.setTexture(spritesheet);
}

void Species::act(Creature& self, Engine& e, sf::Time dt) {}

void Species::draw(Creature& self, sf::RenderTarget& rt) {
	auto& anim = animations[self.animation];
	
	self.frame += anim.fps*dt.asSeconds();
	
	int f = self.frame;
	self.frame += f%anim.frames.size() - f;
	
	auto& frame = anim.frames[self.frame];
	
	self.sprite.setTextureRect(
		sf::IntRect{frame.x, frame.y, anim.w, anim.h}
	);
}

Creature::Creature() {
	species = nullptr;
	frame = 0;
	animation = 0;
}

Creature::Creature(float x, float y) {
	species = nullptr;
	frame = 0;
	animation = 0;
	sprite.setPosition(x, y);
}

void Creature::act(Engine& e, sf::Time dt) {
	if(species) {
		species->act(*this, e, dt);
	}
	else {
		dprint(DEBUG_CLEAN, "Creature with null species is trying to act");
	}
}

void Creature::draw(sf::RenderTarget& rt) {
	if(species) {
		species->draw(*this, rt);
	}
	else {
		dprint(DEBUG_CLEAN, "Creature with null species is trying to draw");
	}
}

Room::~Room() {
	for(auto v : entities) {
		delete v;
	}
}

void Room::act(Engine& e, sf::Time dt) {
	for(auto v : entities)v {
		v->act(e, dt);
	}
}

void Room::draw(sf::RenderTarget& rt) {
	for(auto v : entities) {
		v->draw(rt);
	}
}

