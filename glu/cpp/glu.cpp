#include "glu.hpp"

struct FileVisitor:public Visitor{
	FILE* f;
	
	void visit(NumberNode* n){
		fwrite(&n->id,sizeof(uint32_t),1,f);
		fwrite(&n->val,sizeof(double),1,f);
	}
	
	void visit(CallNode* n){
		uint32_t zero=0;
		fwrite(&zero,sizeof(uint32_t),1,f);
		fwrite(
	}
	
	void visit(IntrinsicNode* n){
		
	}
};

namespace glu{
	void write(GraphNode* n,FILE* f){
		
	}
	
	void NumberNode::accept(Visitor* v){
		v->visit(this);
	}

	void CallNode::accept(Visitor* v){
		v->visit(this);
	}

	void IntrinsicNode::accept(Visitor* v){
		v->visit(this);
	}
}
