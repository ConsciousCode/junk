struct Ascii {
	char value;
	
	static Ascii fromCodePoint(int cp);
	static int toCodePoint();
};

template<typename ENC>
struct String {
	Array<ENC> data;
	
	String();
	
};
