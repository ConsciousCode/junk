#ifndef VOXELMAP_HPP
#define VOXELMAP_HPP

#include "constants.hpp"

#include "Position.hpp"
#include "VoxelChunk.hpp"
#include "Voxel.hpp"

/**
 * Manages all the voxel loading and handling.
**/
class VoxelMap {
	private:
		/**
		 * Dynamically-sized list of voxel chunks squares, the viewable area.
		 *  The primary dimension is the vertical axis, since that tends
		 *  to be heavily restricted visually, while the other two axes are
		 *  the horizontal plane.
		**/
		VoxelChunk* blocks[SECTION_SIZE][SECTION_SIZE];
		
		/**
		 * Structure for pending block loads.
		**/
		struct PendingBlock {
			/**
			 * The VoxelBlock to load into.
			**/
			VoxelBlock* pending;
		};
		
		/**
		 * Pending stack.
		**/
		std::stack<PendingBlock> to_load;
	public:
		/**
		 * Get the voxel at the given position.
		**/
		Voxel get(Position p);
		
		/**
		 * Set the voxel at the given position.
		**/
		void set(Position p, Voxel v);
};

#endif
