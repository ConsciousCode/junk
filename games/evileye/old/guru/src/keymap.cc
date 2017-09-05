#include <cctype>

#include "input.hpp"

/**
 * This file establishes a link to and from the SFML keys and their names.
 *  It's pretty self-contained, so it's been put in this file to be included
 *  directly in "input.cpp"
**/

//These are used by both key -> string and string -> key
#define KN(x) K(Num ## x)
#define KNP(x) KN(pad ## x)
#define KF(x) K(F ## x)

///Key -> string

#define K(x) case sf::Keyboard::x: return #x;

/**
 * Convert a key to its corresponding name.
**/
static const char* key_name(sf::Keyboard::Key key) {
	switch(key) {
		K(A) K(B) K(C) K(D) K(E) K(F) K(G) K(H) K(I) K(J) K(K) K(L) K(M)
		K(N) K(O) K(P) K(Q) K(R) K(S) K(T) K(U) K(V) K(W) K(X) K(Y) K(Z)
		KN(0) KN(1) KN(2) KN(3) KN(4) KN(5) KN(6) KN(7) KN(8) KN(9)
		K(Escape)
		K(LControl) K(LShift) K(LAlt) K(LSystem)
		K(RControl) K(RShift) K(RAlt) K(RSystem)
		K(Menu)
		K(LBracket) K(RBracket)
		K(SemiColon) K(Comma) K(Period) K(Quote) K(Slash) K(BackSlash)
		K(Tilde) K(Equal) K(Dash)
		K(Space) K(Return) K(BackSpace) K(Tab)
		K(PageUp) K(PageDown) K(End) K(Home) K(Insert) K(Delete)
		K(Add) K(Subtract) K(Multiply) K(Divide)
		K(Left) K(Right) K(Up) K(Down)
		KNP(0) KNP(1) KNP(2) KNP(3) KNP(4) KNP(5) KNP(6) KNP(7) KNP(8) KNP(9)
		KF(1) KF(2) KF(3) KF(4) KF(5) KF(6) KF(7) KF(8)
		KF(9) KF(10) KF(12) KF(13) KF(14) KF(15)
		K(Pause)
		
		case sf::Keyboard::Unknown:
		default:
			return "Unknown";
	}
}

#undef K

///String -> key

#define K(x) {#x, sf::Keyboard::x},

/**
 * Static map object using C++11 initializer to relate strings to keys,
 *  as strings can't be effectively compared like keys can with a switch.
**/
static const std::map<std::string, sf::Keyboard::Key> _keynames = {
	K(A) K(B) K(C) K(D) K(E) K(F) K(G) K(H) K(I) K(J) K(K) K(L) K(M)
	K(N) K(O) K(P) K(Q) K(R) K(S) K(T) K(U) K(V) K(W) K(X) K(Y) K(Z)
	KN(0) KN(1) KN(2) KN(3) KN(4) KN(5) KN(6) KN(7) KN(8) KN(9)
	K(Escape)
	K(LControl) K(LShift) K(LAlt) K(LSystem)
	K(RControl) K(RShift) K(RAlt) K(RSystem)
	K(Menu)
	K(LBracket) K(RBracket)
	K(SemiColon) K(Comma) K(Period) K(Quote) K(Slash) K(BackSlash)
	K(Tilde) K(Equal) K(Dash)
	K(Space) K(Return) K(BackSpace) K(Tab)
	K(PageUp) K(PageDown) K(End) K(Home) K(Insert) K(Delete)
	K(Add) K(Subtract) K(Multiply) K(Divide)
	K(Left) K(Right) K(Up) K(Down)
	KNP(0) KNP(1) KNP(2) KNP(3) KNP(4) KNP(5) KNP(6) KNP(7) KNP(8) KNP(9)
	KF(1) KF(2) KF(3) KF(4) KF(5) KF(6) KF(7) KF(8)
	KF(9) KF(10) KF(12) KF(13) KF(14) KF(15)
	K(Pause)
	
	//This can't use K because that'd leave a trailing comma
	{"Unknown", sf::Keyboard::Unknown}
};

/**
 * Convert a name to its corresponding key. Case insensitive.
**/
static sf::Keyboard::Key name_key(std::string name) {
	char c = name[0];
	
	name[0] = toupper(c);
	if(name[0] != c) {
		dprint(DEBUG_CLEAN, "name_key(\"", name, "\")");
	}
	
	for(int i = 1; i < name.length(); ++i) {
		c = name[i];
		name[i] = tolower(c);
		
		if(name[i] != c) {
			dprint(DEBUG_CLEAN, "name_key(\"", name, "\")");
		}
	}
	
	auto it = _keynames.find(name);
	if(it == _keynames.end()) {
		return sf::Keyboard::Unknown;
	}
	
	return it->second;
}

#undef KF
#undef KNP
#undef KN

#undef K

