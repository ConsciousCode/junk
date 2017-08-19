struct NShell {
	virtual void process(Vector in, Vector out) = 0;
};

struct Brain : public NShell {
	int nmem, ninp, nout;
	
	//R, Z = (inp + mem) x mem
	//Y = (inp + mem) x out
	
	int8_t* RZ_Y;
	
	Brain(int nm, int ni, int no);
	~Brain();
	
	virtual void process(Vector in, Vector out);
	
	void backwards(Vector xe, Vector ye);
	void learn(Vector x, Vector y, Vector ye);
};

struct Walnut : public NShell {
	std::vector<Brain*> nodes;
	std::vector<Vector> interim;
	
	virtual void process(Vector in, Vector out);
};

