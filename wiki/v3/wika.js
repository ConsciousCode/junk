var wika=(function(){
	'use strict';
	
	function mixed_parse(parsers,text,pos){
		var pl=[],o;
		for(var i=0;i<parsers.length;++i){
			var p=parsers[i];
			pl.push({est:p.estimate(text,pos),parser:p});
		}
		pl.sort(function(a,b){
			return a.est-b.est;
		});
		
		for(var i=0;i<pl.length;++i){
			if(o=p[i].parser.parse(text,pos)){
				return {
					plain:text.slice(p[i].est
				};
			}
		}
	}
	
	function Parser(sp){
		this.subparsers=sp;
		this.pos=0;
	}
	Parser.prototype={
		parse:function(text){
			this.pos=0;
			
			
			
			
		}
	};
	
	return {
		Parser:Parser
	};
})();
