#include "overworld/tile.hpp"

#include "config.hpp"

TileManager::TileManager(){
	tileset.loadFromFile("data/tileset.png");
	tile.setTexture(tileset);
	numtiles=tileset.getSize().x/TILESIZE+1;
}

void TileManager::render(unsigned short id,int x,int y,sf::RenderTarget* out){
	//id 0 is reserved for a blank space
	if(id){
		--id;
		tile.setTextureRect(
			sf::IntRect{int(id*TILESIZE),0,TILESIZE,TILESIZE}
		);
		tile.setPosition(x,y);
		out->draw(tile);
	}
}

/*
void TileManager::collide(float x,float y,float* dx,float* dy,Collision ct){
	float vdx=*dx,vdy=*dy,speed=sqrt(vdx*vdx+vdy*vdy);
	switch(ct){
		case NONE: break;
		case BLOCK:
			*dx=0;
			*dy=0;
			break;
		case TOPLEFT:
			if(*dx>0 || *dy<0){
				*dx=0;
				*dy=0;
			}
			break;
		default:
			break;
	}
}
//*/
