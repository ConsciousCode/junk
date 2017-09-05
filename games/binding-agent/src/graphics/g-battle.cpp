#include "graphics/g-battle.hpp"

/**
 * Utility for making vertices
**/
sf::Vertex mk_vert(unsigned x,unsigned y){
	return sf::Vertex{sf::Vector2f{(float)x,(float)y}};
}

G_Battle::G_Battle():
		grid_verts{sf::Lines,2*(WIDTH+HEIGHT)+4},
		grid_rect{sf::Vector2f{WIDTH*GRIDW,HEIGHT*GRIDH}}
{	
	grid_rect.setFillColor(sf::Color::Transparent);
	grid_rect.setOutlineColor(sf::Color::White);
	grid_rect.setOutlineThickness(1);
	
	for(unsigned x=0;x<WIDTH;++x){
		grid_verts.append(mk_vert(GRIDX+x*GRIDW,GRIDY));
		grid_verts.append(mk_vert(GRIDX+x*GRIDW,GRIDY+HEIGHT*GRIDH));
	}
	
	for(unsigned y=0;y<WIDTH;++y){
		grid_verts.append(mk_vert(GRIDX,GRIDY+y*GRIDH));
		grid_verts.append(mk_vert(GRIDX+WIDTH*GRIDW,GRIDY+y*GRIDH));
	}
}

void G_Battle::render(sf::RenderTarget* rt){
	rt->clear();
	rt->draw(grid_verts);
	rt->draw(grid_rect);
}
