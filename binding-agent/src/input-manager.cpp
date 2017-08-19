#include "input-manager.hpp"

void InputManager::handle(sf::Event ev){
	bool iskey=false,isjoy=false;
	unsigned js;
	bool state;
	
	switch(ev.type){
		case sf::Event::KeyPressed:
			iskey=true;
			state=true;
			break;
		case sf::Event::KeyReleased:
			iskey=true;
			state=false;
			break;
		case sf::Event::JoyButtonPressed:
			isjoy=true;
			state=true;
			js=ev.JoyButton.JoystickId;
			break;
		case sf::Event::JoyButtonReleased:
			isjoy=true;
			state=false;
			js=ev.JoyButton.JoystickId;
			break;
		case sf::Event::JoyMoved:
			js=ev.JoyButton.JoystickId;
			break;
		default:
			return;
	}
	
	if(iskey){
		for(unsigned i=0;i<Action::MAX;++i){
			if(keys[i]==ev.Key.Code){
				actions[i]=state;
			}
		}
	}
	else if(isjoy){
		for(unsigned i=0;i<Action::MAX;++i){
			if(joysticks[i]==js && joy_buttons[i]==ev.JoyButton.Button){
				actions[i]=state;
			}
		}
	}
	else{
		for(unsigned i=0;i<Action::MAX;++i){
			if(joysticks[i]==js && joy_axes[i]==ev.JoyMove.Axis){
				actions[i]=(ev.JoyMove.Position/joy_axis_dir[i]>=1);
			}
		}
	}
}

void InputManager::bind_key(sf::Keyboard::Key key,InputManager::Action act){
	keys[act]=key;
	joysticks[act]=-1;
	joy_buttons[act]=-1;
	joy_axis_dir[act]=0;
}

void InputManager::bind_joy_axis(
	unsigned js,sf::Joystick::Axis axis,float sensitivity,Action act
){
	if(js<sf::Joystick::Count){
		throw std::logic_error{
			"InputManager::bind_joy_axis : joystick id is larger than the"
			" supported joystick count"
		};
	}
	keys[act]=sf::Keyboard::Unknown;
	joysticks[act]=js;
	joy_buttons[act]=-1;
	joy_axes[act]=axis;
	joy_axis_dir[act]=sensitivity;
}

void InputManager::bind_joy_button(unsigned js,unsigned button,Action act){
	if(js<sf::Joystick::Count){
		throw std::logic_error{
			"InputManager::bind_joy_axis : joystick id is larger than the"
			" supported joystick count"
		};
	}
	keys[act]=sf::Keyboard::Unknown;
	joysticks[act]=js;
	joy_buttons[act]=button;
	joy_axis_dir[act]=0;
}

bool InputManager::pressed(Action act) const{
	return actions[act];
}
