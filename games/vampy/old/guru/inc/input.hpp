#ifndef GURU_INPUT_HPP
#define GURU_INPUT_HPP

#include <SFML/Window.hpp>

#include <map>

struct Controller;
struct InputManager;
struct InputMapper;

//raw -> map -> normalize -> react

/**
 * An abstract interface for an arbitrary input source.
**/
struct IInputSource {
	virtual ~IInputSource() = default;
	
	/**
	 * Associate the binding identifier to the given binding.
	**/
	virtual bool bind(const std::string& n, const std::string& b) = 0;
	
	/**
	 * Process an event.
	**/
	virtual void process(InputManager& in, const sf::Event& ev) = 0;
};

/**
 * Keyboard input source.
**/
struct Keyboard : public IInputSource {
	/**
	 * Key bindings.
	**/
	std::map<sf::Keyboard::Key, std::string> bindings;
	
	virtual bool bind(const std::string& n, const std::string& b);
	virtual void process(InputManager& c, const sf::Event& ev);
};

/**
 * Main input interface for the engine, acting as a kind of virtual controller.
**/
struct InputManager {
	/**
	 * Sources of input for the game which are managed by the input manager.
	**/
	std::vector<IInputSource*> sources;
	
	/**
	 * Buttons on the controller, either pushed or not.
	**/
	std::map<std::string, bool> button;
	
	/**
	 * An input which can be [0, 1], such as a trigger button or joystick.
	**/
	std::map<std::string, float> range;
	
	void addSource(IInputSource* iis);
	
	void process(const sf::Event& ev);
	
	bool bind(const std::string& n, const std::string& b);
};

#endif

