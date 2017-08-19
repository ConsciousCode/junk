#ifndef SNOW_HPP
#define SNOW_HPP

#include <string>

namespace snow {
	struct Flake;
	struct Text;
	struct Tag;
	struct Section;

	struct Flake {
		virtual Text* asText();
		virtual Tag* asTag();
		virtual Section* asSection();
		
		virtual bool eq(Flake* other) = 0;
	};

	struct Text : public Flake {
		std::string value;
		
		virtual Text* asText();
	};

	struct Tag : public Flake {
		std::vector<Flake*> pos;
		std::map<Flake*, Flake*> named;
		
		virtual Tag* asTag();
		
		Flake* get(int x);
		Flake* get(const std::string& x);
		Flake* get(Flake* x);
	};

	struct Section : public Flake {
		std::vector<Flake*> value;
		
		Flake* get(int x);
	};
	
	Section* parse(const std::string& s);
}

#endif

