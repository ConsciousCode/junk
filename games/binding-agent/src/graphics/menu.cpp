#include "graphics/menu.hpp"

GraphicalMenu::GraphicalMenu(){
	g_rect.setFillColor(sf::Color::Black);
	g_rect.setOutlineColor(sf::Color::White);
	g_rect.setOutlineThickness(1);
}

void GraphicalMenu::draw(sf::RenderTarget& target,sf::RenderStates states)const{
	target.draw(g_rect);
	states=states;
}
