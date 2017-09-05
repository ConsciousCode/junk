#include <cstdio>
#include <cassert>

#include <string>

#include "my/pprint.hpp"

#include "param.hpp"

#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>

void debug_pixel(sf::RenderTarget& rt, float x, float y, sf::Color c=sf::Color::Black) {
	sf::RectangleShape px{sf::Vector2f{3, 3}};
	px.setFillColor(c);
	px.setPosition(x - 1, y - 1);
	rt.draw(px);
}

template<typename S, typename T>
struct PrettyPrinter<S, sf::Vector2<T>> {
	static S type() {
		return "sf::Vector2<" + PrettyPrinter<S, T>::type() + ">";
	}
	
	static S print(const sf::Vector2<T>& v) {
		return pprint<S>("<", v.x, ", ", v.y, ">");
	}
};

template<typename... A>
void dprint(A&&... args) {
	printf("Debug: %s\n", pprint<std::string>(args...).c_str());
}

template<typename T>
T sign(T x) {
	if(x < 0) {
		return -1;
	}
	
	if(x > 0) {
		return 1;
	}
	
	return 0;
}

/**
 * Flooring snap
**/
float snapdown(float p) {
	return floorf(p/TILESIZE)*TILESIZE;
}

/**
 * Ceiling snap
**/
float snapup(float p) {
	return ceilf(p/TILESIZE)*TILESIZE;
}

enum Direction {
	NONE = 0, LEFT = 1, UP = 2, RIGHT = 4, DOWN = 8, ALL = 15
};

struct Tile {
	uint8_t id;
	
	unsigned mask : 4;
	
	Tile(uint8_t i=0) {
		id = i;
		mask = NONE;
	}
	
	void draw(float x, float y, sf::RenderTarget& rt, sf::Texture& tex) {
		sf::Sprite tile{
			tex, sf::IntRect{0, id*TILESIZE, TILESIZE, TILESIZE}
		};
		tile.setPosition(x, y);
		
		rt.draw(tile);
	}
	
	/**
	 * Returns whether or not the given direction is reisted by this tile's
	 *  directional solidity.
	**/
	bool resists(sf::Vector2f dir) {
		bool horiz = dir.x && (dir.x < 0? mask&RIGHT : mask&LEFT);
		bool vert = dir.y && (dir.y < 0? mask&DOWN : mask&UP);
		
		return horiz || vert;
	}
};

/**
 * A rectangle of intersection within a tile block. Used to moderate tile-based
 *  collisions.
**/
struct Intersect {
	int x0, y0, x1, y1;
};

struct Block {
	sf::Texture tileset;
	
	Tile tiles[BLOCKW*BLOCKH];
	
	/**
	 * dsnap to the nearest tile.
	**/
	static sf::Vector2f normalize(sf::Vector2f pos, sf::Vector2f dir) {
		pos.x = snapdown(pos.x);
		pos.y = snapdown(pos.y);
		return pos;
	}
	
	/**
	 * Find the intersection of tiles with the given boundary box.
	**/
	Intersect collide(sf::Vector2f pos, sf::Vector2f bounds) {
		return Intersect{
			floorf(pos.x/TILESIZE), floorf(pos.y/TILESIZE),
			floorf((pos.x + bounds.x)/TILESIZE),
			floorf((pos.y + bounds.y)/TILESIZE)
		};
	}
	
	/**
	 * Collisions are directional and based on whisker sampling. This handles
	 *  whisker sampling by checking if the whisker, moving in a direction,
	 *  hits a solid tile.
	**/
	bool isSolid(sf::Vector2f pos, sf::Vector2f dir) {
		auto next = normalize(pos + dir, dir);
		
		//Collisions only matter when transitioning between tiles
		if(normalize(pos, dir) == next) {
			return false;
		}
		
		return get(next).resists(dir);
	}
	
	Tile& at(unsigned x, unsigned y) {
		assert(x < BLOCKW && y < BLOCKH);
		return tiles[y*BLOCKW + x];
	}
	
	Tile get(sf::Vector2f pos) {
		if(pos.x >= 0 && pos.x < WINW && pos.y >= 0 && pos.y < WINH) {
			return at(floor(pos.x/TILESIZE), floor(pos.y/TILESIZE));
		}
		
		return Tile{};
	}
	
	void set(sf::Vector2f pos, const Tile& t) {
		if(pos.x >= 0 && pos.x < WINW && pos.y >= 0 && pos.y < WINH) {
			at(floor(pos.x/TILESIZE), floor(pos.y/TILESIZE)) = t;
		}
	}
	
	void draw(sf::RenderTarget& rt) {
		for(int y = 0; y < BLOCKH; ++y) {
			for(int x = 0; x < BLOCKW; ++x) {
				tiles[y*BLOCKW + x].draw(x*TILESIZE, y*TILESIZE, rt, tileset);
			}
		}
	}
};

struct Player {
	sf::CircleShape sprite;
	
	static constexpr float HSPEED = JUMP_HEIGHT*TILESIZE/GSPEED;
	
	/**
	 * Vertical speed.
	**/
	float vs;
	
	/**
	 * Controls
	**/
	bool left, right, up, down, jumping;
	
	Player() : sprite{8} {
		left = right = up = down = jumping = false;
		vs = 0;
		
		sprite.setPosition(352, TILESIZE + 1);
	}
	
	void update(Block& b, sf::Time dt) {
		float secs = dt.asSeconds(),
			hs = (right - left)*HSPEED,
			dx = hs*secs,
			dy = vs*secs;
		auto pos = sprite.getPosition();
		
		if(dx) {
			sf::Vector2f hwhisker = pos;
			
			if(dx > 0) {
				hwhisker.x += 15;
			}
			hwhisker.y += 8;
			
			if(b.isSolid(hwhisker, sf::Vector2f{dx, 0})) {
				pos.x = snapdown(pos.x);
			}
			else {
				pos.x += dx;
			}
			sprite.setPosition(pos);
		}
		
		auto vwhisker = pos;
		vwhisker.x += 8;
		
		auto gw = vwhisker;
		gw.y += 15;
		
		if(dy > 0) {
			vwhisker.y += 16;
		}
		
		//Moving up
		if(dy < 0) {
			//Ceiling
			if(b.isSolid(vwhisker, sf::Vector2f{0, dy})) {
				//End upward movement
				vs = 0;
			}
		}
		//Idle or falling
		else {
			//Check for a platform
			if(b.isSolid(gw, sf::Vector2f{0, GRAV*secs})) {
				vs = 0;
				jumping = false;
				
				pos.y = snapup(pos.y);
				sprite.setPosition(pos);
				return;
			}
		}
		
		//Normal vertical movement
		sprite.move(0, dy);
		vs += GRAV*secs;
	}
	
	void draw(sf::RenderTarget& rt) {
		rt.draw(sprite);
			sf::Vector2f hwhisker = sprite.getPosition();
			hwhisker.x += 8;
			
			if(vs > 0) {
				hwhisker.y += 16;
			}
			debug_pixel(rt, hwhisker.x, hwhisker.y);
	}
	
	void handle_input(const sf::Event& ev) {
		bool value;
		
		switch(ev.type) {
			case sf::Event::KeyPressed:
				value = true;
				break;
			
			case sf::Event::KeyReleased:
				value = false;
				break;
			
			default:
				return;
		}
		
		switch(ev.key.code) {
			case sf::Keyboard::A:
				left = value;
				break;
			
			case sf::Keyboard::D:
				right = value;
				break;
			
			case sf::Keyboard::W:
				up = value;
				break;
			
			case sf::Keyboard::S:
				down = value;
				break;
			
			case sf::Keyboard::Space:
				if(value) {
					if(!jumping) {
						jumping = true;
						vs = JUMP;
					}
				}
		}
	}
};

/**
 * Compartmentalize as much of the debug menu as we can
**/
struct DebugOverlay {
	sf::Font font;
	sf::Text content;
	
	Tile tpl;
	
	float px, py;
	
	DebugOverlay() {
		font.loadFromFile("debug.ttf");
		content.setPosition(0, 0);
		content.setFont(font);
		content.setScale(0.5, 0.5);
	}
	
	void draw(sf::RenderTarget& rt, Block& b) {
		sf::RectangleShape rs{sf::Vector2f{WINW - 32, 64}};
		rs.setFillColor(sf::Color::Black);
		rs.setPosition(0, WINH);
		rt.draw(rs);
		
		tpl.draw(WINW - TILESIZE - 8, WINH + 8, rt, b.tileset);
		
		float x = WINW - TILESIZE - 8, y = WINH + 40;
		
		Tile tmp;
		if(tpl.mask & LEFT) { tmp.id = 1; tmp.draw(x, y, rt, b.tileset); }
		if(tpl.mask & UP) { tmp.id = 2; tmp.draw(x, y, rt, b.tileset); }
		if(tpl.mask & RIGHT) { tmp.id = 3; tmp.draw(x, y, rt, b.tileset); }
		if(tpl.mask & DOWN) { tmp.id = 4; tmp.draw(x, y, rt, b.tileset); }
	}
	
	void update() {
	}
};

int main() {
	sf::RenderWindow window{sf::VideoMode{WINW, WINH + 64}, "Glitchgame"};
	sf::Clock clock;
	
	Block room;
	Player player;
	DebugOverlay debug;
	
	room.tileset.loadFromFile("tiles.png");
	
	for(int i = 0; i < BLOCKW; ++i) {
		room.tiles[i].id = 4;
		room.tiles[i].mask = DOWN;
		
		room.tiles[(BLOCKH - 1)*BLOCKW + i].id = 2;
		room.tiles[(BLOCKH - 1)*BLOCKW + i].mask = UP;
	}
	
	for(int i = 1; i < BLOCKH - 1; ++i) {
		room.tiles[i*BLOCKW].id = 3;
		room.tiles[i*BLOCKW].mask = RIGHT;
		
		room.tiles[i*BLOCKW + BLOCKW - 1].id = 1;
		room.tiles[i*BLOCKW + BLOCKW - 1].mask = LEFT;
	}
	
	window.setFramerateLimit(60);
	
	while(window.isOpen()) {
		sf::Event ev;
		while(window.pollEvent(ev)) {
			switch(ev.type) {
				case sf::Event::Closed:
					window.close();
					break;
				
				case sf::Event::MouseButtonPressed:
					if(ev.mouseButton.button == sf::Mouse::Left) {
						Tile& t = room.at(
							ev.mouseButton.x/TILESIZE,
							ev.mouseButton.y/TILESIZE
						);
						
						t.id = debug.tpl.id;
						t.mask = debug.tpl.mask;
					}
					
					break;
				
				case sf::Event::KeyPressed:
					switch(ev.key.code) {
						case sf::Keyboard::Escape:
							window.close();
							continue;
						
						case sf::Keyboard::Tilde:
							debug.tpl.id = (debug.tpl.id + 1)%5;
							continue;
						
						case sf::Keyboard::Left:
							debug.tpl.mask ^= LEFT;
							continue;
						case sf::Keyboard::Up:
							debug.tpl.mask ^= UP;
							continue;
						case sf::Keyboard::Right:
							debug.tpl.mask ^= RIGHT;
							continue;
						case sf::Keyboard::Down:
							debug.tpl.mask ^= DOWN;
							continue;
						
						default: break;
					}
					//Fallthrough
							
				default:
					player.handle_input(ev);
			}
		}
		
		window.clear(sf::Color::Magenta);
		
		sf::Time dt = clock.getElapsedTime();
		clock.restart();
		
		player.update(room, dt);
		debug.update();
		
		room.draw(window);
		player.draw(window);
		debug.draw(window, room);
		
		window.display();
	}
	
	return 0;
}

