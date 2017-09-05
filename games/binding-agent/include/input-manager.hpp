#ifndef GAME_INPUT_MANAGER
#define GAME_INPUT_MANAGER

#include <SFML/Window.hpp>

#include "input.hpp"

/**
 * Class which abstracts input management, including key rebinding.
**/
class InputManager:public Input{
	private:
		/**
		 * Key bindings for keyboard, InputManager::Action -> sf::Keyboard::Key.
		 *  If unset, the key is set to sf::Keyboard::Key::Unknown
		**/
		sf::Keyboard::Key keys[Action::MAX]={
			sf::Keyboard::Tab,sf::Keyboard::Space,sf::Keyboard::Tilde,
			sf::Keyboard::W,sf::Keyboard::S,sf::Keyboard::A,sf::Keyboard::D
		};
		
		/* Joystick data */
		
		/**
		 * The IDs of the joysticks, -1 if none is being used.
		**/
		signed char joysticks[Action::MAX]={-1};
		/**
		 * Button bindings for joystick, InputManager::Action -> unsigned <
		 *  sf::Joystick::ButtonCount, -1 if unset
		**/
		signed char joy_buttons[Action::MAX]={-1};
		/**
		 * Axis bindings for joystick, InputManager::Action ->
		 *  sf::Joystick::Axis
		**/
		sf::Joystick::Axis joy_axes[Action::MAX];
		/**
		 * 0 means unset, non-zero indicate the sensitivity and direction
		**/
		float joy_axis_dir[Action::MAX]={0};
		
		/**
		 * The action states.
		**/
		bool actions[Action::MAX]={false};
	public:
		/**
		 * Handle an incoming event.
		**/
		void handle(sf::Event ev);
		
		/**
		 * Bind a keyboard key to an action.
		**/
		void bind_key(sf::Keyboard::Key key,Action act);
		/**
		 * Bind a joystick axis to an action.
		 * 
		 * @param js The joystick ID
		 * @param axis The joystick axis
		 * @param sensitivity The sensitivity of the axis, [-1, 1] is normal,
		 *  higher will be adjusted to work
		 * @param act The action to bind to
		**/
		void bind_joy_axis(
			unsigned js,sf::Joystick::Axis axis,float sensitivity,Action act
		);
		/**
		 * Bind a joystick button to an action.
		**/
		void bind_joy_button(unsigned js,unsigned button,Action act);
		
		/**
		 * Query whether or not the given action is active
		**/
		bool pressed(Input::Action act) const;
};

#endif
