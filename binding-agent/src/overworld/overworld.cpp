#include <algorithm>
#include <cmath>

#include "overworld/overworld.hpp"

#include "config.hpp"
#include "game.hpp"

OverworldManager::OverworldManager(){
	tile_cache.create((VIEWW+2)*TILESIZE,(VIEWH+2)*TILESIZE);
	
	renderable_tile_cache.setTexture(tile_cache.getTexture(),true);
	renderable_tile_cache.setTextureRect(
		sf::IntRect{0,0,VIEWW*TILESIZE,VIEWH*TILESIZE}
	);
	
	player_spritesheet.loadFromFile("data/player.png");
	player_sprite.setTexture(player_spritesheet);
	player_sprite.setPosition(VIEWW/2*TILESIZE,VIEWH/2*TILESIZE);
}

OverworldManager::~OverworldManager(){
	if(cur){
		delete cur;
	}
	
	for(auto map: maps){
		delete map;
	}
}

void OverworldManager::render(sf::RenderWindow* window){
	if(cur){
		window->clear();
		window->draw(renderable_tile_cache);
		window->draw(player_sprite);
	}
}

void OverworldManager::enterMap(Map* map){
	cur=map;
	
	update_tilecache();
	
	//Then clear the map cache and load the nearby rooms
}

void OverworldManager::update(Game* game,sf::Time frame){
	float
		dx=game->input.horizontalAct()*frame.asMilliseconds()*SPEED,
		dy=game->input.verticalAct()*frame.asMilliseconds()*SPEED;
	
	if(dx || dy){
		if(dx && dy){
			dx/=sqrt(2);
			dy/=sqrt(2);
		}
		
		auto view=renderable_tile_cache.getTextureRect();
		viewx+=dx;
		viewy+=dy;
		
		view.left=std::max((int)viewx,0);
		view.top=std::max((int)viewy,0);
		
		if(cur->height<viewy+VIEWH){
			view.height=std::max(int(cur->height*TILESIZE-viewy),0);
		}
		else{
			view.height=VIEWH*TILESIZE;
		}
		
		renderable_tile_cache.setPosition(
			-std::min((int)viewx,0),-std::min((int)viewy,0)
		);
		
		renderable_tile_cache.setTextureRect(view);
	}
}

void OverworldManager::update_tilecache(){
	unsigned
		offx=(unsigned)fmod(viewx,TILESIZE),
		offy=(unsigned)fmod(viewy,TILESIZE);
	
	for(unsigned y=0;y<cur->height;++y){
		for(unsigned x=0;x<cur->width;++x){
			tm.render(
				cur->get(viewx/TILESIZE+x,viewy/TILESIZE+y),
				viewx+x*TILESIZE-offx,viewy+y*TILESIZE-offy,
				&tile_cache
			);
		}
	}
}
