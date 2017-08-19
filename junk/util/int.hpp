#ifndef UTIL_INTEGER_HPP
#define UTIL_INTEGER_HPP

#include <cstdint>

namespace util {
	constexpr int system_endianness() {
		union {
			uint_fast32_t i;
			uint8_t b[sizeof(uint_fast32_t)];
		} u;
		//The contents really don't matter provided they're different
		u.b = {0x01, 0x02, 0x03, 0x04};
		
		//High bits correspond to lower indices, big endian
		if(u.i == 0x01020304) {
			return 1;
		}
		//High bits correspond to high indices, lil endian
		else if(u.i == 0x04030201) {
			return -1;
		}
		//No idea what this is
		else {
			return 0;
		}
	}
	
	template<size_t N>
	using sint = int;
	
	template<size_t N>
	using uint = unsigned;
	
	template<> using sint<1> = bool;
	template<> using uint<1> = bool;
	using int1 = bool;
	using uint1 = bool;
	
	template<> using sint<8> = int8_t;
	template<> using uint<8> = uint8_t;
	using int8 = int8_t;
	using uint8 = uint8_t;
	
	template<> using sint<16> = int16_t;
	template<> using uint<16> = uint16_t;
	using int16 = int16_t;
	using uint16 = uint16_t;
	
	template<> using sint<32> = int32_t;
	template<> using uint<32> = uint32_t;
	using int32 = int32_t;
	using uint32 = uint32_t;
	
	using uint = unsigned int;
	
	template<> using sint<64> = int64_t;
	template<> using uint<64> = uint64_t;
	using int64 = int64_t;
	using uint64 = uint64_t;
	
	template<typename T>
	constexpr T flip_endian(T v) {
		union {
			T u;
			uint8_t u8[sizeof(T)];
		} src, dst;
		
		src.u = u;
		
		for(size_t k = sizeof(T); k > 0; --k) {
			dst.u8[sizeof(T) - k] = src.u8[k - 1];
		}
		
		return dst.u;
	}
	
	template<typename T>
	struct big {
		T v;
		
		big(T u):v(u) {}
		
		operator T() const {
			if(system_endianness() < 0) {
				return flip_endian(v);
			}
			else {
				return v;
			}
		}
	};
	
	template<size_t N>
	using big = big<sint<N>>;
	template<size_t N>
	using ubig = big<uint<N>>;
	
	template<typename T>
	struct lil {
		T v;
		
		lil(T u):v(u) {}
		
		operator T() const {
			if(system_endianness() > 0) {
				return flip_endian(v);
			}
			else {
				return v;
			}
		}
	};
	
	template<size_t N>
	using lil = lil<sint<N>>;
	template<size_t N>
	using lil = lil<uint<N>>;
}

#endif
