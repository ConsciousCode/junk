#include <cstdio>
#include <functional>

template<typename T, typename F>
struct GSequence {
	T last;
	F func;
	
	GSequence() {}
	GSequence(const F& f) : func{f} {}
	GSequence(const T& v, const F& f) : last{v}, func{f} {}
	
	T next() {
		last = func(last);
		return last;
	}
};

struct Incr {
	int operator()(int v) {
		return v + 1;
	}
};

int main() {
	GSequence<int> seq{0, [](int v) { return v; }};
	
	printf("%d\n", seq.next());
	return 0;
}
