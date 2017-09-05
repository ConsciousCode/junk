#include "graphics.hpp"

Graphics::Graphics(sf::RenderTarget& t):target(t){}

sf::RenderTarget& Graphics::unwrap(){
	return target;
}
