/**
 * Epoxy is an SSA form for Glu used as a translation pass to make imperative
 *  language translations easier. It's designed to act as a solely structural
 *  transformation which can be applied without knowing what the intrinsics do
**/
glu.epoxy=(function(){
	'use strict';
	
	function GraphNode(meta){
		this.meta=meta||{};
	}
	
	function Code(params,code,meta){
		GraphNode.call(this,meta);
		
		this.params=params;
		this.code=code;
	}
	Code.prototype=Object.create(GraphNode.prototype);
	
	function Intrinsic(name,params){
		this.name=name;
		this.params=params;
	}
	
	function Call(code,params,out){
		this.code=code;
		this.params=params;
		this.out=out;
	}
	
	function Register(id){
		this.id=id;
	}
})();
