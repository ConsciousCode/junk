#ifndef UTIL_HPP

template<typename T, template<typename> M=NewAlloc>
struct Array {
	size_t size, capacity;
	T* data;
	
	Array() {
		size = 0;
		capacity = 0;
		data = nullptr;
	}
	
	Array(size_t n) {
		size = n;
		capacity = n;
		data = M<T>::create(n, [](T* v){ new (v) T; });
	}
	
	Array(size_t n, T&& t) {
		size = n;
		capacity = n;
		data = M<T>::create(n, [&t](T* v){ new (v) T(t); });
	}
	
	Array(Array<T>&& mv) {
		size = mv.size;
		capacity = mv.capacity;
		data = mv.data;
		mv.data = nullptr;
	}
	
	Array(const Array<T>& v) {
		size = v.size;
		capacity = v.capacity;
		data = M<T>::copy(v.size, v.data);
	}
	
	Array(T* it, T* end) {
		size = end - it;
		capacity = size;
		data = M<T>::copy(size, it);
	}
	
	~Array() {
		if(data) {
			M<T>::destroy(size, data);
		}
	}
	
	T& operator[](int i) {
		if(i < 0) {
			i += size;
			if(i < 0) {
				i -= size;
				goto fail;
			}
		}
		
		if(i < size) {
			return data[i];
		}
		
		throw RangeError(str<Array<T>>() + " out of bounds with " + str(i));
	}
	
	
};

template<typename T>
Array<T>::Iterator iter(Array<T>& a);

template<typename T>
struct NewAlloc {
	template<typename F__Tp>
	static T* create(size_t n, F__Tp f) {
		T* d = (T*)malloc(n*sizeof(T));
		for(size_t i = 0; i < n; ++i) {
			f(&d[i]);
		}
		return d;
	}
	
	static void destroy(size_t n, T* v) {
		for(size_t i = 0; i < n; ++i) {
			v[i].~T();
		}
		
		free(v);
	}
	
	static T* copy(size_t n, T* v) {
		T* d = T(*)malloc(n*sizeof(T));
		for(size_t i = 0; i < n; ++i) {
			new (&d[i]) T(v[i]);
		}
		
		return d;
	}
};

#endif

