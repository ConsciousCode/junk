#ifndef UTIL_FILE_HPP
#define UTIL_FILE_HPP

#include <cstdio>

namespace util {
	struct Path;
	struct File;
	
	struct Path {
		static char SEP =
			'/'
		;
		static char DEL =
			':'
		;
		std::string path;
		
		Path();
		Path(const std::string& path);
		Path(Path&& p);
		
		Path operator+(Path&& p);
		Path operator-(Path&& p);
		
		std::string ext() const;
		std::string dir() const;
		std::string base() const;
		
		std::string drive() const;
		
		Path abs() const;
		Path normalize() const;
		Path rel(Path&& p) const;
		Path append(Path&& p) const;
		
		Stat stat() const;
		
		bool isRel() const;
		bool isAbs() const;
		bool isDir() const;
		bool isValid() const;
		bool exists() const;
		
		File open();
		File open(int flags);
		
		const File openReadable() const;
		File openWritable();
		
		static Path tmp();
		static Path cwd();
		static Path root();
	}
	
	struct File {
		Path path;
		FILE* handle;
		
		File();
		File(File&& f);
		File(Path&& p);
		File(FILE* fh);
	
		operator Path() const;
		operator bool() const;
		
		bool isValid() const;
		bool open();
		bool hasNext();
		
		size_t size() const;
		
		size_t tell() const;
		
		size_t offset(int off);
		size_t seek(int pos);
		
		template<typename T>
		size_t read(T* target, size_t count=1) {
			return fread(target, sizeof(T), count, handle);
		}
		
		template<typename T>
		T read() {
			static_assert(
				std::is_pod<T>::value,
				"File::read() is only valid for POD types."
			);
			
			T v;
			if(fread(&v, sizeof(T), 1, handle) != sizeof(T)) {
				throw std::runtime_error("Reached EOF while reading.");
			}
			
			return v;
		}
	};
	
	template<typename R>
	R read(File* f);
}

#endif
