#include "VoxelChunk.hpp"

void VoxelChunk::load(FILE* f);

void VoxelChunk::save(FILE* f);

struct _Quadtree {
	bool seen;
	
	struct _Quadtree* children;
};

void _remesh(SMesh

void VoxelChunk::remesh(VoxelDefMap* vdefs) {
	SMesh* mesh = new SMesh();
	SMeshBuffer* buf = new SMeshBuffer();
	
	mesh->addMeshBuffer(buf);
	buf->drop();
	
	Octree* cur = root;
	
	std::vector<Octree*> level, next;
	
	do {
		int x;
		
		for(Octree* ot : level) {
			next.push_back(ot);
		}
		switch(cur->slice) {
			case WHOLE:
				for(int x = 0; x < todo.top().w; ++x) {
					for(int y = 0; y < todo.top().h; ++y) {
						for(int z = 0; z < todo.top().d; ++z) {
		}
		
		for(Octree* ot : level) {
			if(ot->slice != WHOLE) {
				goto keep_going;
			}
		}
	}while(0);
}
