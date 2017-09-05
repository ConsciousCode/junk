glu.glu2js=(function(){
	'use strict';
	
	var intrinsics={
		add:function(params){
			if(params.length!=3){
				throw new Error("add intrinsic takes 3 parameters");
			}
			
			return "("+params[0].visit(this)+"+"+params[1].visit(this)+")";
		},
		sub:function(params){
			if(params.length!=3){
				throw new Error("sub intrinsic takes 3 parameters");
			}
			
			return "("+params[0].visit(this)+"-"+params[1].visit(this)+")";
		},
		mul:function(params){
			if(params.length!=3){
				throw new Error("sub intrinsic takes 3 parameters");
			}
			
			return "("+params[0].visit(this)+"*"+params[1].visit(this)+")";
		},
		div:function(params){
			if(params.length!=4){
				throw new Error("div intrinsic takes 4 parameters");
			}
			
			return "("+params[0].visit(this)+"-"+params[1].visit(this)+")";
		}
	};
	
	function create_name(x){
		var digits="bcdfghijklmnpqrsvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$",
			base=digits.length,
			name="";
		
		do{
			name+=digits[x%base];
			x=(x/base)|0;
		}while(x>0);
		
		return name;
	}
	
	function process_code(code,params){
		return process_code(code.next,params);
	}
	
	function glu2js(entry){
		return (//new Function("'use strict';"+
			entry.visit({
				visit_number:function(num){
					return num.value.toString();
				},
				visit_param:function(param){
					console.log(this.memo_obj);
					var i=this.memo_obj.indexOf(param);
					if(i<0){
						throw new Error("Parameter used before assignment");
					}
					
					return i;
				},
				visit_code:function(code){
					var next=code.next;
					if(next instanceof glu.IntrinsicNode){
						var i=intrinsics[next.name];
						if(typeof i!="undefined"){
							return i.call(this,code.params);
						}
						
						throw new Error('Unknown intrinsic "'+next.name+'"');
					}
					return "@";
				},
				visit_intrinsic(i){
					return "?!";
				},
				memo_obj:[],
				memo_name:[],
				name:0
			})+";return b"
		)//)();
	}
	
	return glu2js;
})();
