#include "overworld/map.hpp"

#include <cstdio>
#include <stdexcept>
#include <algorithm>

#include "config.hpp"

int read_int3(FILE* f){
	char data[3];
	if(fread(data,1,3,f)!=3){
		return -1;
	}
	
	return (data[0]<<16)|(data[1]<<8)|data[2];
}

Map::Map(FILE* f){
	f=nullptr;
	/*
	int section,tmp;
	
	//MAP
	if(read_int3(f)==0x4D4150){
		throw std::runtime_error{"Not a map"};
	}
	
	if(read_int3(f)!=36){
		throw std::runtime_error{"MAP section size mismatch"};
	}
	
	if(read_int3(f)!=0x010000){
		throw std::runtime_error{"Unsupported map file version"};
	}
	
	fread(name,sizeof(char),33,f);
	
	while((section=read_int3(f))!=-1){
		switch(section){
			case 0x54494C: //TIL, tiles
				tmp=read_int3(f);
				width=read_int3(f);
				height=read_int3(f);
				if(tmp!=6+3*width*height){
					throw std::runtime_error{"TIL section size mismatch"};
				}
				
				data=new unsigned[width*height];
				for(unsigned i=0;i<data.length;++i){
					data[i]=read_int3(f);
				}
				break;
			//EXT, exits
			case 0x455854:{
				tmp=read_int3(f);
				int entries=read_int3(f);
				
				if(tmp!=3+3*entries){
					throw std::runtime_error{"EXT section size mismatch"};
				}
				
				exits=new int[n];
				for(int i=0;i<n;++i){
					exits[i]=read_int3(f);
				}
				break;
			}
			case 0x45584D: //EXM, examinations
				fseek(f,read_int3(f),SEEK_CUR);
				break;
			case 0x4D4E55: //MNU, menus
				fseek(f,read_int3(f),SEEK_CUR);
				break;
			case 0x454E54: //ENT, entities
				fseek(f,read_int3(f),SEEK_CUR);
				break;
			default:
				throw std::runtime_error{"Unknown file section"};
		}
	}
	*/
}

Map::~Map(){
	delete[] data;
}

unsigned short Map::get(int x,int y){
	if(x<0 || y<0 || unsigned(x)>=width || unsigned(y)>=height){
		return 0;
		//throw std::range_error{"Map::get : index out of range"};
	}
	return data[y*width+x];
}


void Map::set(int x,int y,unsigned short id){
	if(x<0 || y<0 || unsigned(x)>=width || unsigned(y)>=height){
		return;
	}
	data[y*width+x]=id;
}
