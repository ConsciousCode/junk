var epoxy=(function(){
	'use strict';
	
	/**
	 * Indent a given string
	**/
	function tabify(s){
		return s.replace(/^/gm,'\t');
	}
	
	/**
	 * A singular code block that can be called as a function.
	**/
	function Block(sig,codes){
		this.signature=sig;
		this.codes=codes;
	}
	Block.prototype={
		constructor:Block,
		toString:function(){
			return '['+this.signature.join(", ")+']{\n'+
				tabify(this.codes.join('\n'))+'\n}';
		}
	}
	
	/**
	 * A single triple-value code for an imperative operation.
	**/
	function Code(op,args,res){
		this.op=op;
		this.args=args;
		this.result=res;
	}
	Code.prototype={
		constructor:Code,
		toString:function(){
			return "("+this.op+", "+this.args.join(", ")+") -> "+this.result;
		}
	}
	
	/**
	 * Special 
	function Return(val){
		this.val=val;
	}
	Return.prototype={
		constructor:Return,
		toString:function(){
			return "return "+this.val;
		}
	}
	
	function Throw(val){
		this.val=val;
	}
	Throw.prototype={
		constructor:Throw,
		toString:function(){
			return "throw "+this.val;
		}
	}
	
	function Yield(to){
		this.to=to;
	}
	Yield.prototype={
		constructor:Yield,
		toString:function(){
			return "yield to "+this.val;
		}
	}
})();
