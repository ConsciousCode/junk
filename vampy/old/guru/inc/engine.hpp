#ifndef GURU_ENGINE_HPP
#define GURU_ENGINE_HPP

struct Engine;

#include "animate.hpp"
#include "input.hpp"
#include "random.hpp"
#include "entity.hpp"

#include "debug.hpp"

/**
 * Engine binds together all the core working components of the game.
**/
struct Engine {
	sf::RenderWindow window;
	
	InputManager input;
	
	//AudioManager* audio;
	//AssetManager* asset;
	
	Sequencer sequencer;
	Random random;
	
	IEntity* root;
	
	bool running;
	
	Engine(int w, int h, const char* title="", int fps=60);
	
	/**
	 * Stop the engine.
	**/
	void stop();
	
	/**
	 * Makes the game's window visible.
	**/
	void show();
	
	/**
	 * Run one frame of the game.
	 *
	 * @param dt The amount of time that has elapsed since the last frame. This
	 *  is used by actors for interpolation to hide frame-based animation.
	**/
	void update(sf::Time dt);
	
	/**
	 * Run the game until the window closes, effectively taking over the
	 *  thread.
	**/
	void start();
};

#endif

