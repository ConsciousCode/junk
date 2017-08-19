/**
 * High-level unicode character.
**/
struct U32 {
	int32_t value;
	
	bool isRaw() const;
	
	bool isLu() const;
	bool isLl() const;
	bool isLt() const;
	bool isLm() const;
	bool isLo() const;
	bool isMn() const;
	bool isMc() const;
	bool isMe() const;
	bool isNd() const;
	bool isNl() const;
	bool isNo() const;
	bool isPc() const;
	bool isPd() const;
	bool isPs() const;
	bool isPe() const;
	bool isPi() const;
	bool isPf() const;
	bool isPo() const;
	bool isSm() const;
	bool isSc() const;
	bool isSk() const;
	bool isSo() const;
	bool isZs() const;
	bool isZl() const;
	bool isZp() const;
	bool isCc() const;
	bool isCf() const;
	bool isCs() const;
	bool isCo() const;
	bool isCn() const;
};

struct Text;

struct Rope {
	size_t size;
	Text** strings;
};

struct Text {
	enum Encoding {
		Raw,
		Rope,
		ASCII7,
		ISO_Latin1
	} enc;
	
	union {
		uint8_t raw[];
		Rope rope;
		
		uint8_t ascii7;
		
		uint8_t latin1;
		
		uint8_t utf8;
		uint16_t utf16;
		uint32_t utf32;
	};
	
	Text(Encoding e);
	
	U32 get(size_t x) const;
	void set(size_t x, U32 v);
};

struct String {
	private:
		Text* data;
	public:
		String();
		String(char c, size_t rep=1);
		String(const char* text);
		String(Encoding enc, const char* text);
		
		~String();
		
		
};
