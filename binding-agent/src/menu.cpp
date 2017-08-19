#include "menu.hpp"

Menu::Menu(){
	
}

Menu::~Menu(){
	
}

void Menu::render(sf::RenderTarget* rt){
	rt->draw(g_menu_bg);
}
