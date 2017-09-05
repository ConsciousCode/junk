#ifndef GURU_RANDOM_HPP
#define GURU_RANDOM_HPP

#include <random>

/**
 * Allows separate entropy pools to be maintained so, for instance, one can be seeded
 *  while the other is affected by user input.
**/
struct RandomChannel {
	std::mt19937 generator;
	std::uniform_int_distribution<int> uniform;
	std::normal_distribution<float> normal;
	
	virtual ~RandomChannel() = default;
	
	void seed();
	void seed(int x);
	
	template<typename T>
	void seed(T&& beg, T&& end) {
		std::seed_seq seed{beg, end};
		generator.seed(seed);
	}
	
	bool chance(float x);
	
	int dice(int n, int sides);
};

/**
 * Encapsulates all randomness a game might need.
**/
struct Random : public RandomChannel {
	std::vector<RandomChannel*> channels;
	
	~Random();
	
	/**
	 * Easier access to the other channels, with 0 always referring to this.
	**/
	RandomChannel& operator[](unsigned x);
};

#endif
