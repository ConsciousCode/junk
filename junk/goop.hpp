#ifndef GOOP_HPP
#define GOOP_HPP

/**
 * 
**/

namespace goop {
	struct SizeUnit;
		struct Pixels;
		struct Ratio;
		struct Pointsize;
	
	struct Node;
	struct Container;
		struct Rows;
		struct Cols;
		struct Layers;
		struct Table;
		struct Flow;
	
	struct Size {
		virtual int toPixels(Node* parent, Node* self);
		
		virtual ~Size() = default;
	};
	
	struct Pixels : public Size {
		int px;
		
		Pixels(int p);
		
		virtual int toPixels(Node* parent, Node* self);
	};
	
	struct Ratio : public Size {
		int num, den;
		
		Pixels(int n, int d);
		
		virtual int toPixels(Node* parent, Node* self);
	};
	
	struct Pointsize : public Size {
		int pt;
		
		Pointsize(int p);
		
		virtual int toPixels(Node* parent, Node* self);
	};
	
	struct Node {
		Size* getWidth();
		Size* getHeight();
		
		
	};
	
	struct Container : public Node {
		std::vector<Node*>&& children();
	};
	
	struct Rows : public Container {
		
	};
}

#endif

