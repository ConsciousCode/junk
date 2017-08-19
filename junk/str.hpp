#ifndef UTIL_STR_HPP
#define UTIL_STR_HPP

#include <string>
#include <vector>
#include <map>


template<typename T>
String str() {
	return typeid(T).name();
}

template<> String str<bool>() { return "bool"; }
template<> String str<char>() { return "char"; }
template<> String str<short>() { return "short"; }
template<> String str<int>() { return "int"; }
template<> String str<long>() { return "long"; }
template<> String str<float>() { return "float"; }
template<> String str<double>() { return "double"; }

template<typename T>
String str<long T>() {
	return "long " + str<T>();
}

template<typename T>
String str<signed T>() {
	return "signed " + str<T>();
}

template<typename T>
String str<unsigned T>() {
	return "unsigned " + str<T>();
}

template<typename T>
String str<const T>() {
	return "const " + str<T>();
}

template<typename T>
String str<T*>() {
	return str<T>() + "*";
}

template<typename T>
String str<T const*>() {
	return str<T>() + " const*";
}

template<typename T>
String str<T&>() {
	return str<T>() + "&";
}

template<typename T>
String str<T&&>() {
	return str<T>() + "&&";
}

template<typename T>
String str<T[]>() {
	return str<T>() + "[]";
}

namespace {
	template<typename X, typename... R>
	String construct_typelist() {
		return str<X>() + ", " + construct_typelist<R...>();
	}
	
	template<typename X>
	String construct_typelist() {
		return str<X>();
	}
}

template<typename R, typename... A>
String str<R(*)(A...)>() {
	return str<R>() + "(" + construct_typelist<A...>() + ")";
}

template<typename T, size_t N>
String str<T(&)[N]>() {
	return str<T>() + "[" + str(N) + "]";
}

template<typename T>
String str(const T& v) {
	return "<" + str<T>() + " @ " + str((long long)&v, 16) + ">";
}

template<>
String str(const bool& v) {
	return v? "true" : "false";
}

template<>
String str(const char& v) {
	return v;
}

template<>
String str(const long double& v) {
	char buf[64];
	snprintf(buf, 64, "%Lf", v);
}

template<>
String str(const std::string& s) {
	return s;
}

template<typename T>
String str(const std::vector<T>& v) {
	return "[" + join(v, ", ") + "]";
}

template<typename T>

