#ifndef GLU_HPP
#define GLU_HPP

#include <cstdio>

namespace glu{
	struct GraphNode;
	struct CallNode;
	struct IntrinsicNode;
	struct Visitor;
	
	struct Visitor{
		virtual void visit(NumberNode* nn)=0;
		virtual void visit(CallNode* nn)=0;
		virtual void visit(IntrinsicNode* nn)=0;
	};
	
	void write(GraphNode* n,FILE* f);

	struct GraphNode{
		std::vector<GraphNode*> uses;
		
		virtual void accept(Visitor* gv)=0;
	};
	
	struct NumberNode:public GraphNode{
		static constexpr uint32_t id=0x724fecd5;
		double val;
		
		void accept(Visitor* v);
	};
	
	struct CallableNode:public GraphNode{};
	
	struct CallNode:public CallableNode{
		CallableNode* next;
		std::vector<GraphNode*> params;
		
		void accept(Visitor* v);
	};
	
	struct IntrinsicNode:public CallableNode{
		uint32_t id;
		
		void accept(Visitor* v);
	};
}

#endif
