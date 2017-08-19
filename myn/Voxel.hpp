#ifndef VOXEL_HPP
#define VOXEL_HPP

#include "material.hpp"

typedef unsigned char param_t;

class Voxel {
	unsigned char code;
	
	bool isSolid();
};

/**
 * Singular definition for a block used to instantiate blocks.
**/
struct VoxelDef {
	/**
	 * The light emitted by the block.
	**/
	param_t light;
	
	/**
	 * The material ids.
	**/
	material_t materials[6];
	
	/**
	 * The smallest size possible for the block (max 15, = 2^-size).
	**/
	param_t minsize;
	
	/**
	 * The block's tendency to avoid breaking.
	**/
	param_t cohesion;
};

#endif
