#ifndef GURU_ANIMATE_HPP
#define GURU_ANIMATE_HPP

#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>

/**
 * Structure for managing sequences of events
**/
struct Sequence {
	bool live, able;
	
	Sequence* next;
	
	virtual void update(sf::Time t);
	
	virtual Sequence* play() = 0;
	virtual Sequence* cancel() = 0;
	
	virtual Sequence* then(Sequence* seq) = 0;
};

/**
 * Manages all active sequences
**/
struct Sequencer {
	std::vector<Sequence*> live;
	
	void update(sf::Time t);
};

struct Spriteset : public sf::Sprite {
	struct Frame {
		int offx, offy;
	};
	
	struct Animation {
		int width, height;
		int originx, originy;
		std::vector<Frame> frames;
	};
	
	std::vector<Animation> anim;
};

#endif

