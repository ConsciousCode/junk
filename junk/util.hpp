template<typename T>
struct Allocator {
	protected:
		mutable size_t _size, _capacity;
		mutable T* _data;
		
		void p_move(T* src, T* dst, size_t len) {
			for(size_t i = 0; i < len; ++i) {
				new(&src[i])T(std::move(dst[i]));
			}
		}
		
		template<typename... CA>
		void p_init(T* d, size_t len, CA... args) {
			for(size_t i = 0; i < len; ++i) {
				new(&d[i])T(args...);
			}
		}
		
		void p_destroy(T* d, size_t len) {
			for(size_t i = 0; i < len; ++i) {
				d[i].~T();
			}
		}
		
		void p_dealloc() {
			if(_data) {
				p_destroy(_data, &_data[_size]);
				operator delete[](_data);
			}
		}
	
	public:
		Allocator() : _size{0}, _capacity{0}, _data{nullptr} {}
		
		Allocator(Allocator<T>&& a) {
			_data = a._data;
			a._data = nullptr;
			a._size = 0;
			a._capacity = 0;
		}
		
		Allocator(const Allocator<T>& a) : _size{a._size}, _capacity{a._size} {
			T* mem = (T*)operator new[](sizeof(T)*a._size);
			p_move(a._data, mem, &mem[_size]);
			_data = mem;
		}
		
		template<typename... CA>
		Allocator(size_t s, size_t c, CA... args) : _size{s}, _capacity{c} {
			assert(s <= c);
			
			T* mem = (T*)operator new[](sizeof(T)*s);
			size_t i = 0;
			
			try {
				for(; i < c; ++i) {
					new(&mem[i])T(args...);
				}
				
				return mem;
			}
			catch(...) {
				//Allocator isn't completed, so its destructor won't be called.
				// Destroy anything that we made.
				p_destroy(mem, i);
				
				throw;
			}
		}
		
		~Allocator() {
			p_dealloc();
		}
		
		size_t size() const { return _size; }
		size_t capacity() const { return _capacity; }
		T* data() const { return _data; }
		
		template<typename... CA>
		void resize(size_t s, CA... args) {
			if(s < _size) {
				//We need to destroy the objects that are now out of range
				p_destroy(&_data[s], _size);
			}
			else if(s > _size) {
				//Get the new expanded memory
				reserve(s);
				
				//Default-initialize the rest
				p_init(&_data[_size], s - _size, args...);
			}
			//else s == _size, nothing to do
			
			_size = s;
		}
		
		/**
		 * Reserve memory for later use
		**/
		void reserve(size_t c) {
			if(c > _capacity) {
				T* mem = (T*)operator new[](sizeof(T)*c);
				
				p_move(_data, mem, _size);
				p_dealloc();
				_data = mem;
			}
		}
		
		T& operator[](size_t x) {
			return _data[x];
		}
		
		const T& operator[](size_t x) const {
			return _data[x];
		}
};

namespace {
	size_t fancy_index(size_t size, int x) {
		assert(x < size && x >= -size);
		if(x >= 0) {
			return x;
		}
		
		return size + x;
	}
}
	
template<typename T>
T saturate(T x, T lo, T, hi) {
	if(x < lo) {
		return lo;
	}
	else if(x > hi) {
		return hi;
	}
	else {
		return x;
	}
}

template<>
size_t arglen() {
	return 0;
}

template<typename X, typename... L>
size_t arglen(X&&, L&&... ls) {
	return 1 + arglen(ls...);
}

template<typename S>

/**
 * Structure which has a runtime-defined size that can't be changed. This acts
 *  mostly as a wrapper for dynamic memory, and thus lacks fancier features.
**/
template<typename T, typename A>
struct Array {
	private:
		template<>
		void set_alloc() {}
		
		template<typename X, typename... L>
		void set_alloc(X&& x, L&&... ls) {
			alloc.resize(size(), x);
			set_alloc(ls...);
		}
	
	protected:
		A alloc;
	
	public:
		Array() {}
		
		Array(Array&& a) : alloc{std::move(a.alloc)} {}
		
		Array(const Array& a) : alloc{a.alloc} {}
		
		Array(size_t size) : alloc{size} {}
		
		template<typename IT>
		Array(IT&& x, IT&& y) : alloc{y - x} {
			for(size_t i = 0; x != y; ++x, ++i) {
				alloc[i] = *x;
			}
		}
		
		template<typename IT>
		Array(IT iter, size_t hint=1) : alloc{0, hint} {
			size_t i = 0;
			for(auto x : iter) {
				alloc.resize(size() + 1, x);
			}
		}
		
		template<typename... L>
		Array(L&&... ls) : alloc{arglen(ls...)} {
			set_alloc(ls);
		}
		
		T& operator[](int x) {
			return alloc[fancy_index(size(), x)];
		}
		
		const T& operator[](int x) const {
			return alloc[fancy_index(size(), x)];
		}
		
		size_t size() const {
			return alloc.size();
		}
};

/**
 * Resizable container for contiguous data.
**/
template<typename T, typename A>
struct Vector : public Array<T, A> {
	using Array<T, A>::Array;
	
	void resize(size_t s) {
		alloc.resize(s);
	}
	
	void reserve(size_t s) {
		alloc.reserve(s);
	}
	
	Vector<T, A> slice(int x, int y) const {
		x = fancy_index(size(), saturate(x, -size(), size());
		y = fancy_index(size(), saturate(y, -size() - 1, size());
		
		return Vector<T, A>{&alloc[x], &alloc[y]};
	}
	
	Vector<T, A> slice(int x) const {
		return slice(x, size());
	}
};

