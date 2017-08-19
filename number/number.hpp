#ifndef NUMBER_HPP
#define NUMBER_HPP

#include <cstdint>
#include <vector>

struct Number{
	protected:
		uint_fast32_t exponent;
		std::vector<uint_fast8_t> data;
		
		static constexpr MAX_DIGIT=1<<(sizeof(uint_fast8_t)*8);
	public:
		Number();
		
		Number(intmax_t i);
		Number(uintmax_t u);
		Number(long double f);
		
		Number operator+(Number o);
};

#endif
