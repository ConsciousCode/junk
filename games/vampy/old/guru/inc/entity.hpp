#ifndef GURU_ENTITY_HPP
#define GURU_ENTITY_HPP

#include <SFML/Graphics.hpp>

struct IEntity;
struct Species;
struct Creature;
struct Room;

#include "util/interface.hpp"

#include "engine.hpp"

/**
 * Something which updates and draws itself per frame.
**/
interface(IEntity) {
	/**
	 * Perform the entity's action for a frame which took place over the time
	 *  described by dt.
	**/
	virtual void act(Engine& e, sf::Time dt) = 0;
	
	/**
	 * Draw the entity.
	**/
	virtual void draw(sf::RenderTarget& rt) = 0;
};

/**
 * A behavior object for handling collisions.
**/
interface(ICollider) {
	/**
	 * Get the bounding box of the given entity with this collision schema.
	**/
	virtual sf::Rect<float> bounds(Entity* e) const = 0;
	
	/**
	 * Check if the given point is "solid" as per this collider's specification.
	**/
	virtual bool contains(Creature* c, float x, float y) const = 0;
};

struct Intangible : public ICollider {
	virtual sf::Rect<float> bounds(Creature* c) const;
	virtual bool contains(Creature* c, float x, float y) const;
};

struct BoundingBox : public ICollider {
	float offx, offy;
	float bbw, bbh;
	
	BoundingBox();
	
	BoundingBox(float ox, float oy, float bw, float bh);
	
	virtual sf::Rect<float> bounds(Creature* c) const;
	virtual bool contains(Creature* c, float x, float y) const;
};

/**
 * Aggregates data common to all instances of a species and acts as a factory
 *  for entities of the same species.
**/
struct Species {
	/**
	 * Data describing one of the specie's animations.
	**/
	struct Animation {
		/**
		 * Offset into the spritesheet.
		**/
		struct Offset {
			int x, y;
		};
		
		/**
		 * The width and height of the animation.
		**/
		int w, h;
		
		/**
		 * How fast the animation should be played.
		**/
		float fps;
		
		/**
		 * The frames of the animations.
		**/
		std::vector<Offset> frames;
	};
	
	/**
	 * How this species collides.
	**/
	ICollider* collider;
	
	/**
	 * The spritesheet for the species (may be the same for all).
	**/
	sf::Texture spritesheet;
	
	/**
	 * The animations of the species.
	**/
	std::vector<Animation> animations;
	
	virtual Creature* generate(float x, float y);
	
	virtual void act(Creature& self, Engine& e, sf::Time dt);
	
	virtual void draw(Creature& self, sf::RenderTarget& rt);
};

/**
 * An entity which shares its looks and behaviors with other entities with
 *  the same species.
**/
struct Creature : public IEntity {
	/**
	 * Coordinates standard behaviors of the entity's species.
	**/
	Species* species;
	
	/**
	 * The sprite the entity uses for rendering.
	**/
	sf::Sprite sprite;
	/**
	 * The animation index of the entity.
	**/
	int animation;
	
	/**
	 * The frame of the animation it's currently on. This value is a float
	 *  to enable sub-frame animation that keeps pace with the game loop.
	**/
	float frame;
	
	Creature();
	
	Creature(float x, float y);
	
	virtual void act(Engine& e, sf::Time dt);
	
	virtual void draw(sf::RenderTarget& rt);
};

/**
 * An entity which holds other entities. This is intended to be used as an
 *  entry point for the game's handling, but making it an entity allows game
 *  states to be manipulated as singular objects.
**/
struct Room : public IEntity {
	std::vector<IEntity*> entities;
	
	virtual ~Room();
	
	virtual void act(Engine& e, sf::Time dt);
	
	virtual void draw(sf::RenderTarget& rt);
};

/**
 * Groups together entities which are capable of colliding with each other.
**/
struct CollisionGroup {
	std::vector<Creature*> members;
};

#endif

