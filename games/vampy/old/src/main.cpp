#include "guru/engine.hpp"

struct Bullet : public Species {
	sf::CircleShape sprite;
	
	Bullet(float x, float y, float dx, float dy):sprite{2}, dx(dx), dy(dy) {
		sprite.setPosition(x, y);
	}
	
	virtual void act(Creature& c, Engine& e, sf::Time dt) {
		sprite.move(dx*dt.asSeconds(), dy*dt.asSeconds());
	}
	
	virtual void draw(Creature& c, sf::RenderTarget& rt) {
		rt.draw(sprite);
	}
};

struct Player : public Species {
	sf::CircleShape sprite;
	
	Player(float x, float y):sprite{8} {
		sprite.setPosition(x, y);
	}
	
	virtual void act(Creature& c, Engine& e, sf::Time dt) {
		float speed = 64*dt.asSeconds();
		player.move(
			(e.input.button["right"] - e.input.button["left"])*speed,
			(e.input.button["down"] - e.input.button["up"])*speed
		);
	}
	
	virtual void draw(Creature& c, sf::RenderTarget& rt) {
		rt.draw(sprite);
	}
};

struct EvilEye : public Room {
	Player player;
	
	EvilEye():player{240, 180} {
	}
	
	~EvilEye() {
		for(auto ent : ents) {
			delete ent;
		}
	}
	
	void add(IEntity* ent) {
		ents.push_back(ent);
	}
	
	virtual void act(Engine& e, sf::Time dt) {
		if(e.input.button["close"]) {
			e.stop();
		}
		
		auto pos = player.getPosition();
		float x = pos.x, y = pos.y;
		
		if(e.input.button["air"]) {
			add(new Bullet(x, y, 0, -80));
		}
		
		if(e.input.button["fire"]) {
			add(new Bullet(x, y, -80, 0));
		}
		
		if(e.input.button["water"]) {
			add(new Bullet(x, y, 80, 0));
		}
		
		if(e.input.button["earth"]) {
			add(new Bullet(x, y, 0, 80));
		}
		
		Room::act(e, dt);
	}
	
	virtual void draw(sf::RenderTarget& rt) {
		rt.draw(player);
		
		Room::draw(rt);
	}
};


int main() {
	Engine e{480, 360, "Game"};
	Keyboard kb;
	EvilEye ee;
	
	e.input.addSource(&kb);
	e.root = &ee;
	
	e.input.bind("A", "left");
	e.input.bind("W", "up");
	e.input.bind("S", "down");
	e.input.bind("D", "right");
	
	e.input.bind("Up", "air");
	e.input.bind("Down", "earth");
	e.input.bind("Left", "fire");
	e.input.bind("Right", "water");
	
	e.input.bind("Escape", "close");
	
	e.start();
	
	return 0;
}

