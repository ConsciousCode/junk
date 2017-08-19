/**
 * Defines utility classes for handling units so I don't mix them up
**/
#ifndef GLITCHGAME_UNITS_HPP
#define GLITCHGAME_UNITS_HPP

#include <cassert>

#include "param.hpp"

#include "my/arithmetic.hpp"

/**
 * Common methods for spaces.
**/
template<typename T>
struct Space : I_Arithmetic<Space<T>> {
	T x, y;
	
	Space() : x{0}, y{0} {}
	
	Space(const sf::Vector2<T>& p) : x{p.x}, y{p.y} {}
	
	/**
	 * Conversion to the unit's degenerate form
	**/
	sf::Vector2<T> degenerate() const {
		return sf::Vector2<T>{x, y};
	}
	
	operator sf::Vector2<T>() {
		return degenerate();
	}
	
	Space<T> operator+(const Space<T>& o) const {
		return degenerate() + o.degenerate();
	}
	
	Space<T> operator-(const Space<T>& o) const {
		return degenerate() - o.degenerate();
	}
};

/**
 * The integer space indexing a 2D tile matrix; values are invalid out of range
**/
struct TileSpace;
/**
 * The real space corresponding to sprite positions on-screen.
**/
struct UserSpace;

struct TileSpace : Space<unsigned> {
	using Space<unsigned>::Space;
	
	TileSpace(unsigned xx, unsigned yy) {
		assert(xx < BLOCKW && y < BLOCKH);
		
		x = xx;
		y = yy;
	}
};

struct UserSpace : public Space<float> {
	using Space<float>::Space;
	
	UserSpace(float xx, float yy) : x{xx}, y{yy} {}
	
	operator sf::Vector2f() const {
		return sf::Vector2f{x, y};
	}
};

#endif

