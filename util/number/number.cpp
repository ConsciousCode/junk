#include "number.hpp"

Number():exponent(0){}

Number(intmax_t i):data{sizeof(intmax_t)/sizeof(uint_fast8_t)}{
	uint_fast8_t digits[sizeof(intmax_t)/sizeof(uint_fast8_t)];
	uint_fast8_t* end=digits+sizeof(intmax_t)/sizeof(uint_fast8_t);
	uint_fast8_t* d=end;
	
	if(i<0){
		i=-i;
		bool carry=!(*d=~(i%MAX_DIGIT)+1);
		i/=DIGITS;
		
		while(i>0){
			carry=!(*--d=~(i%MAX_DIGIT)+carry);
			i/=DIGITS;
		}
	}
	else{
		while(i>0){
			*--d=i%MAX_DIGIT;
			i/=MAX_DIGIT;
		}
	}
	
	while(d!=end){
		data.push_back(*(d++));
	}
}

Number(uintmax_t u):data{sizeof(uintmax_t)/sizeof(uint_fast8_t)}{
	uint_fast8_t digits[sizeof(intmax_t)/sizeof(uint_fast8_t)];
	uint_fast8_t* end=digits+sizeof(intmax_t)/sizeof(uint_fast8_t);
	uint_fast8_t* d=end;
	
	while(i>0){
		*--d=i%MAX_DIGIT;
		i/=MAX_DIGIT;
	}
	
	while(d!=end){
		data.push_back(*(d++));
	}
}

Number(long double f){
	if(f<0){
		f=-f;
		long double whole=floorl(f),frac=f-whole;
		
		uint_fast16_t digit=~(uint_fast16_t)fmodl(whole,MAX_DIGIT)+1;
		bool carry=!digit;
		
		data.insert(data.begin(),digit);
		whole=floorl(whole/MAX_DIGIT);
		
		while(whole>=1){
			data.insert(data.begin(),
				~(uint_fast16_t)fmodl(whole,MAX_DIGIT)+carry
			);
			whole=floorl(whole/MAX_DIGIT);
		}
		
		while(frac>0){
			frac*=MAX_DIGIT;
			data.push_back(
		}
}

Number operator+(Number o);
