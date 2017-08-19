#ifndef VOXEL_BLOCK_HPP
#define VOXEL_BLOCK_HPP

#include <irrlicht.h>

using namespace irr::scene;

namespace {
	/**
	 * Abstract octree.
	**/
	struct Octree {
		/**
		 * Slicing command for this octree branch, used for efficiency and
		 *  cohesion with the file format.
		**/
		enum Slice {
			WHOLE = 0,
			HALF_X = 1,
			HALF_Y = 2,
			HALF_Z = 3,
			QUAD_X = 4,
			QUAD_Y = 5,
			QUAD_Z = 6,
			OCT = 7
		} slice;
		
		union {
			/**
			 * The children of the octree (if a slice).
			**/
			Octree* children[];
			
			/**
			 * The material of the node (if WHOLE).
			**/
			Voxel vox;
		};
	};
}

/**
 * A 16^3 cube of voxels used to speed up rendering via mesh caching.
**/
class VoxelChunk {
	private:
		/**
		 * The root of the voxel block's octree.
		**/
		Octree* root;
	
	public:
		/**
		 * Cache for projection meshes.
		**/
		IMesh* proj[6];
		
		/**
		 * Load a voxel block from the given file, seek'd to its entry.
		**/
		void load(FILE* f);
		
		/**
		 * Save the voxel block to the given file, seek'd to its final position.
		**/
		void save(FILE* f);
		
		/**
		 * Recreate the projection meshes.
		**/
		void remesh();
};

#endif
