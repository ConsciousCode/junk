#include "snow.hpp"

Text* Flake::asText() {
	return nullptr;
}

Tag* Flake::asTag() {
	return nullptr;
}

Section* Flake::asSection() {
	return nullptr;
}

Text* Text::asText() {
	return this;
}

Tag* Tag::asTag() {
	return this;
}

template<typename T>
Flake* u_index(const T& v, int x, int size) {
	if(x < 0) {
		x += size;
		if(x < 0) {
			return nullptr;
		}
		
		return v[x];
	}
	
	if(x < size) {
		return v[x];
	}
	
	return nullptr;
}

Flake* Tag::get(int x) {
	return u_index(pos, x, pos.size());
}

Flake* Tag::get(const std::string& x) {
	Text t{x};
	
	auto it = named.find(&t);
	if(it == named.end()) {
		return nullptr;
	}
	
	return it->second;
}

Flake* Tag::get(Flake* x) {
	auto it = named.find(x);
	if(it == named.end()) {
		return nullptr;
	}
	
	return it->second;
}

Section* Section::asTag() {
	return this;
}

Flake* Section::get(int x) {
	return u_index(value, x, value.size());
}

struct Lexer {
	std::string::iterator it;
	unsigned line, col, pos;
	
	Lexer(std::string::iterator i):it(i) {
		line = 1;
		col = 0;
		pos = 0;
	}
	
	void space() {
		while(isspace(*it)) {
			switch(*it) {
				case '\r':
					++it;
					if(*it != '\n') {
						break;
					}
				case '\n':
				case '\f':
				case '\v':
					break;
				
				default:
					++it;
					continue;
			}
			
			++it;
			++line;
			col = 0;
		}
	}
	
	int nextc() {
		++col;
		++pos;
		
		return *(it++);
	}
};

Text* u_parse_doctext(Lexer* lex) {
	
}

Section* parse(const std::string& s) {
	Lexer lex{s};
	Section* sec = new Section();
	auto left = s.begin();
	
	for(;;) {
		int c = *lex.it;
		switch(c) {
			case '\\':
				++lex.it;
				break;
			
			case '{':
				if(left != lex.it) {
					sec->value.push_back(new Text(std::string{left, lex.it}));
				}
				sec->value.push_back(u_parse_tag(&lex));
				left = lex.it;
				break;
			
			default:
				break;
		}
		
		if(lex.it == s.end()) {
			if(left != lex.it) {
				sec->value.push_back(new Text(std::string{left, lex.it}));
			}
			return sec;
		}
		
		//Handles newlines too
		lex.space();
		
	}
	
	return sec;
}

