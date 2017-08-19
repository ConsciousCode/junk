var glu=(function(){
	'use strict';
	
	function GraphNode(meta){
		if(typeof this=="undefined"){
			throw new Error("Constructor called as function");
		}
		
		if(!(this instanceof GraphNode)){
			throw new TypeError("Constructor called with wrong-typed object");
		}
		
		this.meta=meta||{};
		this.uses=[];
	}
	
	function Type(meta){
		if(typeof this=="undefined"){
			throw new Error("Constructor called as function");
		}
		
		if(!(this instanceof Type)){
			throw new TypeError("Constructor called with wrong-typed object");
		}
		
		GraphNode.call(this,meta);
	}
	var p=Type.prototype=Object.create(GraphNode.prototype);
	p.constructor=Type;
	
	p.eq=function(other){
		return this===other;
	}
	p.visit=function(v){
		return v.visit_type(this);
	}
	p.toString=function(){
		return "?";
	}
	
	function CodeType(params,meta){
		if(typeof this=="undefined"){
			throw new Error("Constructor called as function");
		}
		
		if(!(this instanceof CodeType)){
			throw new TypeError("Constructor called with wrong-typed object");
		}
		
		Type.call(this,meta);
		this.params=params;
		for(var i=params.length;i--;){
			params[i].uses.push(this);
		}
	}
	var p=CodeType.prototype=Object.create(Type.prototype);
	p.constructor=CodeType;
	p.eq=function(other){
		if(this===other){
			return true;
		}
		
		if(other instanceof CodeType){
			var p=this.params,op=other.params,pl=p.length;
			if(pl!=op.length){
				return false;
			}
			
			for(var i=pl;i--;){
				if(!p[i].eq(op[i])){
					return false;
				}
			}
			
			return true;
		}
		
		return false;
	}
	p.toString=function(){
		return "("+this.params.join(",")+")";
	}
	
	function NumberType(meta){
		if(typeof this=="undefined"){
			throw new Error("Constructor called as function");
		}
		
		if(!(this instanceof NumberType)){
			throw new TypeError("Constructor called with wrong-typed object");
		}
		
		Type.call(this,meta);
	}
	var p=NumberType.prototype=Object.create(Type.prototype);
	p.constructor=NumberType;
	p.eq=function(other){
		return other instanceof NumberType;
	}
	p.toString=function(){
		return "#";
	}
	var number_t=new NumberType();
	
	function NumberNode(value,meta){
		if(typeof this=="undefined"){
			throw new Error("Constructor called as function");
		}
		
		if(!(this instanceof NumberNode)){
			throw new TypeError("Constructor called with wrong-typed object");
		}
		
		GraphNode.call(this,meta);
		
		if(!(typeof value=="number")){
			throw new TypeError("NumberNode must be given a number");
		}
		
		this.value=value;
	}
	var p=NumberNode.prototype=Object.create(GraphNode.prototype);
	p.constructor=NumberNode;
	p.visit=function(v){
		return v.visit_number(this);
	}
	p.toString=function(){
		return this.value.toString();
	}
	p.type=number_t;
	
	function ParamNode(type,meta){
		if(typeof this=="undefined"){
			throw new Error("Constructor called as function");
		}
		
		if(!(this instanceof ParamNode)){
			throw new TypeError("Constructor called with wrong-typed object");
		}
		
		GraphNode.call(this,meta);
		
		if(!(type instanceof Type)){
			throw new TypeError("ParamNode type must be a Type");
		}
		this.type=type;
	}
	var p=ParamNode.prototype=Object.create(GraphNode.prototype);
	p.constructor=ParamNode;
	p.visit=function(v){
		return v.visit_param(this);
	}
	
	function CallableNode(meta){
		GraphNode.call(this,meta);
	}
	var p=CallableNode.prototype=Object.create(GraphNode.prototype);
	p.constructor=CallableNode;
	
	function CodeNode(sig,next,params,meta){
		if(typeof this=="undefined"){
			throw new Error("Constructor called as function");
		}
		
		if(!(this instanceof CodeNode)){
			throw new TypeError("Constructor called with wrong-typed object");
		}
		
		CallableNode.call(this,meta);
		
		this.sig=sig;
		var type=[];
		for(var i=sig.length;i--;){
			var s=sig[i];
			if(s instanceof ParamNode){
				s.uses.push(this);
				type.push(s.type);
			}
			else{
				throw new TypeError(
					"CodeNode signature takes ParamNode objects"
				);
			}
		}
		this.type=new CodeType(type);
		
		if(!(next.type instanceof CodeType)){
			throw new TypeError("CodeNode next must be a code type");
		}
		this.next=next;
		next.uses.push(this);
		
		if(!Array.isArray(params)){
			throw new TypeError("CodeNode params must be an array");
		}
		
		this.params=params;
		var np=next.type.params,i=params.length;
		if(i!=np.length){
			throw new Error(
				"CodeNode params have a different length "+
				"from the next code ("+i+" -> "+np.length+")"
			);
		}
		while(i--){
			var p=params[i];
			if(p.type.eq(np[i])){
				p.uses.push(this);
			}
			else{
				throw new TypeError(
					"Parameter #"+(i+1)+" has type "+np[i].type+
					", was passed "+p.type
				);
			}
		}
	}
	var p=CodeNode.prototype=Object.create(CallableNode.prototype);
	p.constructor=CodeNode;
	p.resolve=function(from,to){
		var x,sig=this.sig,next=this.next,params=this.params;
		while((x=sig.indexOf(from))>=0){
			sig[x]=to;
		}
		
		while((x=next.indexOf(from))>=0){
			next[x]=to;
		}
		
		while((x=params.indexOf(from))>=0){
			params[x]=to;
		}
	}
	p.visit=function(v){
		return v.visit_code(this);
	}
	p.free=function(){
		//Parameters declared at this level aren't free
		var free=this.next.free().filter(function(e){
			return this.indexOf(e)==-1;
		},this.sig);
		
		//Add any free parameters
		var params=this.params,pl=params.length;
		for(var i=0;i<pl;++i){
			var p=params[i];
			if(p instanceof ParamNode){
				free.push(p);
			}
		}
		
		return free;
	}
	p.toString=function(){
		return "λ("+
			this.sig.join(" ")+"){"+this.next+"("+this.params.join(" ")+
		")}";
	}
	
	function IntrinsicNode(sig,name,meta){
		if(typeof this=="undefined"){
			throw new Error("Constructor called as function");
		}
		
		if(!(this instanceof IntrinsicNode)){
			throw new TypeError("Constructor called with wrong-typed object");
		}
		
		CallableNode.call(this,meta);
		
		this.sig=sig;
		this.name=name;
		this.type=new CodeType(sig);
	}
	var p=IntrinsicNode.prototype=Object.create(CallableNode.prototype);
	p.constructor=IntrinsicNode;
	p.visit=function(v){
		return v.visit_intrinsic(this);
	}
	p.free=function(){
		return [];
	}
	p.toString=function(v){
		return this.name;
	}
	
	function NameNode(name,meta){
		if(typeof this=="undefined"){
			throw new Error("Constructor called as function");
		}
		
		if(!(this instanceof NameNode)){
			throw new TypeError("Constructor called with wrong-typed object");
		}
		
		GraphNode.call(this,meta);
		
		this.name=name;
	}
	var p=NameNode.prototype=Object.create(GraphNode.prototype);
	p.constructor=NameNode;
	p.resolve=function(value){
		var uses=this.uses,i=uses.length;
		for(;i--;){
			uses[i].resolve(this,value);
		}
	}
	p.visit=function(v){
		return v.visit_name(this);
	}
	
	return {
		t:function(t){
			function build_type(t,i,path){
				function space(s,i){
					var SPACE=/\s+/gm;
					SPACE.lastIndex=i;
					var m=SPACE.exec(s);
					if(m && m.index==i){
						return SPACE.lastIndex;
					}
					return i;
				}
				
				if(t[i]=="#"){
					return {type:number_t,i:i+1};
				}
				
				if(t[i]=="("){
					var sig=[];
					
					do{
						i=space(t,i+1);
						var o=build_type(t,i);
						sig.push(o.type);
						i=space(t,o.i);
					}while(t[i]==',');
					
					if(t[i]==")"){
						return {type:new CodeType(sig),i:i};
					}
					
					throw new Error("Function type must end with a )");
				}
				
				throw new Error('"'+t+'" is not a type');
			}
			
			return build_type(t,0,[]).type;
		},
		Type:Type,
		type_t:new Type(),
		CodeType:CodeType,
		code_t:function(params,meta){
			return new CodeType(params,meta);
		},
		NumberType:NumberType,
		number_t:number_t,
		
		GraphNode:GraphNode,
		NumberNode:NumberNode,
		number:function(value,meta){
			return new NumberNode(value);
		},
		ParamNode:ParamNode,
		param:function(name,meta){
			return new ParamNode(name,meta);
		},
		CallableNode:CallableNode,
		CodeNode:CodeNode,
		code:function(sig,next,params,meta){
			return new CodeNode(sig,next,params,meta);
		},
		IntrinsicNode:IntrinsicNode,
		intrinsic:function(name,meta){
			return new IntrinsicNode(name,meta);
		},
		NameNode:NameNode,
		name:function(meta){
			return new NameNode(meta);
		}
	};
})();
