#include "glu.hpp"

struct Class : public Data {
	std::string name;
};

struct Metaclass : public Class {
	std::vector<Class*> params;
	
	Metaclass(const char* n, std::initializer_list<Class*> p):params(p) {
		name = n;
	}
};

struct Function : public Data {
	Class* domain;
	Class* range;
	Data*(*call)(Data*);
};

struct TupleClass : public Metaclass {
	TupleClass(std::initializer_list<Class*> p):params(p) {
		name = "tuple";
	}
};

template<class... ARGS>
struct Tuple : public Data {
	std::tuple<ARGS...> data;
};

template<class F, class A, class B>
Data* binary(Data* d) {
	auto& args = ((Tuple<A, B>*)d)->data;
	return F(std::get<0>(args), std::get<1>(args));
}

#define esc(...) __VA_ARGS__
#define defun(raw) mkfun< [](Data* __arg) { defun2 raw } >
#define defun2(...) auto& args = ((Tuple<__VA_ARGS__>*)__arg)->data;

Environment::Environment() {
	env["class"] = add(new Class{"class"});
	env["meta"] = add(new Class{"meta"});
	env["int"] = add(new Class{"int"});
	
	env["int+"] = add(new Function(
		new TupleClass(env["int"], env["int"]),
		defun((Int*, Int*) {
			return new Int(std::get<0>(args)->value + std::get<1>(args)->value);
		})
	));
}

Data* Environment::add(Data* d) {
	pool.push_back(d);
	return d;
}
