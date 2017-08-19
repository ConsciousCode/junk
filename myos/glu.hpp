struct Signature {
	Type** elems;
	size_t size;
};

struct Interface {
	Signature signature;
};

struct Value {
	Type type;
	byte data[];
};

struct Operation : public Value {
	Function oper;
	Value** operands;
};

struct Type {
	union {
		int intrinsic;
		Type* alias;
	}
	Signature params;
};

struct Procedure {
	Signature signature;
	Value continuation;
	Value[] args;
};

struct Function {
	Type ret;
	Type** args;
	Procedure proc;
	int* binding;
};

struct CodeBuffer {
	
};

Value* interpret(Function* f);

Value* interpret(Function* f) {
	f->proc
}

