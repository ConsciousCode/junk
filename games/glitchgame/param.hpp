/**
 * This file calculates game parameters from design-amenable values, such as
 *  calculating the gravity parameters given the maximum horizontal and
 *  vertical distance that can be traveled.
**/
#ifndef GRAVITY_HPP
#define GRAVITY_HPP

struct GravParams {
	float GRAV, JUMP;
};

/**
 * Calculate the jump parameters from designer-friendly parameters.
**/
constexpr GravParams jump_params(float peak, float time) {
	//v(t) = gt + v0, y(t) = integral(v) = gt^2 + v0*t
	//y(time/2) = peak = g*(time/2)^2 + v0*(time/2)
	//y(time) = 0 = g*time^2 + v0*time => -v0 = g*time
	
	//peak = g*time^2/4 - g*time^2/2 = g*time^2/4 => g = 4peak/time^2
	// => v0 = -4peak/time
	
	return GravParams{2*peak/(time*time), -2*peak/time};
}

constexpr int
	/**
	 * Size of a tile in pixels.
	**/
	TILESIZE = 16,
	
	/**
	 * Block width in tiles.
	**/
	BLOCKW = 24,
	
	/**
	 * Block height in tiles (roughly golden ratio with ROOMW).
	**/
	BLOCKH = 15,
	
	/**
	 * Jump height in tiles.
	**/
	JUMP_HEIGHT = 4,
	
	/**
	 * Width and height of the window in pixels.
	**/
	WINW = BLOCKW*TILESIZE, WINH = BLOCKH*TILESIZE;

constexpr float GSPEED = 0.4;

constexpr auto _jparams = jump_params(JUMP_HEIGHT*TILESIZE, GSPEED);

constexpr float
	GRAV = _jparams.GRAV,
	JUMP = _jparams.JUMP;

#endif

