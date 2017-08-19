struct Data {
	virtual ~Data() = default;
};

struct Environment {
	std::map<std::string, Data*> env;
	std::vector<Data*> pool;
	
	Environment();
	
	Data* add(Data* d);
};


