/**
 * (type name[, type name]):name(val[, val])
**/
var ooz=(function(){
	'use strict';
	
	function ParseError(msg,line,col) {
		if(this instanceof ParseError){
			var self=Error.call(this,
				msg+" (Ln: "+line+", Col: "+col+")"
			);
			self.line=line;
			self.col=col;
			self.name="ParseError";
			return self;
		}
		else{
			return new ParseError(msg,line,col);
		}
	}
	ParseError.prototype=Object.create(Error.prototype,{
		constructor:{
			value:ParseError,
			enumerable:false,
			writable:true,
			configurable:true
		},
		name:{
			value:"ParseError"
		}
	});
	ParseError.__proto__=Error;
	
	function ParserState(globals){
		this.pos=0;
		this.line=1;
		this.col=0;
		this.scope=[globals||{
			"add":new glu.IntrinsicNode(
				[glu.number_t,glu.number_t,glu.t("(#)")],"add"
			),
			"sub":new glu.IntrinsicNode(
				[glu.number_t,glu.number_t,glu.t("(#)")],"sub"
			),
			"mul":new glu.IntrinsicNode(
				[glu.number_t,glu.number_t,glu.t("(#)")],"mul"
			),
			"div":new glu.IntrinsicNode(
				[glu.number_t,glu.number_t,glu.t("(#)")],"div"
			)
		}];
		this.unresolved={};
	}
	ParserState.prototype={
		resolve:function(block,name){
			var unres=this.unresolved[name];
			if(unres){
				for(var i=unres.length;i--;){
					var ui=unres[i];
					if(sl<=ui.depth){
						ui.value.resolve(block[name]);
					}
				}
			}
		},
		scopify:function(block){
			this.scope.push(block);
			var sl=this.scope.length;
			for(var name in block){
				this.resolve(block,name);
			}
		},
		descopify:function(){
			this.scope.pop();
		},
		getvar:function(name){
			var scope=this.scope,sl=scope.length;
			for(var i=sl;i--;){
				var v=scope[i][name];
				if(v){
					return v;
				}
			}
			
			var un=this.unresolved[name],nn=glu.name({name:name});
			if(un){
				un.push({depth:sl,value:nn});
			}
			else{
				this.unresolved[name]=[{depth:sl,value:nn}];
			}
			
			return nn;
		},
		setvar:function(name,value){
			var scope=this.scope,last=scope[scope.length-1];
			last[name]=value;
			this.resolve(last,name);
		},
		expected:function(text,a,b){
			if(b){
				return new ParseError(
					"Got "+text[this.pos]+", expected "+a+" or "+b,
					this.line,this.col
				);
			}
			
			return new ParseError(
				"Got "+text[this.pos]+", expected "+a,
				this.line,this.col
			);
		},
		maybe:function(text,re){
			re.lastIndex=this.pos;
			var m=re.exec(text);
			if(m && m.index==this.pos){
				var len=m[0].length;
				this.col+=len;
				this.pos+=len;
				
				return m;
			}
			
			return null;
		},
		space:function(text){
			var SPACE=/\s+/g;
			SPACE.lastIndex=this.pos;
			var m=SPACE.exec(text);
			if(m && m.index==this.pos){
				var lines=m[0].split(/\r\n?|[\n\f\v\u0085\u2028\u2028]/g),
					nlc=lines.length-1;
				
				if(nlc){
					this.line+=nlc;
					this.col=lines[nlc].length;
				}
				else{
					this.col+=m[0].length;
				}
				this.pos=SPACE.lastIndex;
			}
		},
		parse_type:function(text){
			switch(text[this.pos]){
				case "?":
					++this.pos;
					++this.col;
					return glu.type_t;
				case "#":
					++this.pos;
					++this.col;
					return glu.number_t;
				case "(":
					var rp=this.pos,rc=this.col,rl=this.line;
					++this.pos;
					++this.col;
					this.space(text);
					var params=[];
					if(text[this.pos]!=")"){
						for(;;){
							params.push(this.parse_type(text));
							
							this.space(text);
							
							if(text[this.pos]==")"){
								break;
							}
							
							if(text[this.pos]!=','){
								this.pos=rp;
								this.col=rc;
								this.line=rl;
								
								return null;
							}
						}
					}
					++this.pos;
					++this.col;
					
					return new glu.code_t(params);
				default:
					return null;
			}
		},
		parse_name:function(text){
			var m=this.maybe(text,/[^\d=(,):][^=(,):]*/g);
			return m && m[0];
		},
		parse_value:function(text){
			var m=this.maybe(text,/\d+(?:\.\d+)?/g);
			if(m){
				return new glu.number(parseFloat(m[0]));
			}
			
			if(m=this.parse_name(text)){
				return this.getvar(m);
			}
			
			return this.parse_type(text) || this.parse_code(text);
		},
		parse_assign:function(text){
			var name=this.parse_name(text);
			if(!name){
				return false;
			}
			
			this.space(text);
			if(text[this.pos]!='='){
				throw this.expected(text,'=');
			}
			this.space(text);
			
			var val=this.parse_value(text);
			if(!val){
				throw new ParseError(
					"Assignment expression must have a value",
					this.line,this.col
				);
			}
			
			this.setvar(name,val);
			return true;
		},
		parse_code:function(text){
			if(text[this.pos]!='('){
				return null;
			}
			
			var tl=text.length,line=this.line,col=this.col,params=[];
			
			++this.pos;
			++this.col;
			
			this.space(text);
			
			if(text[this.pos]!=')'){
				for(;;){
					if(this.pos>=tl){
						throw new ParseError(
							"Encountered EOF while parsing code signature",
							line,col
						);
					}
					
					var t=this.parse_type(text);
					this.space(text);
					var n=this.parse_name(text);
					
					params.push({
						name:n,
						obj:new glu.param(t,{name:n})
					});
					
					this.space(text);
					if(text[this.pos]==')'){
						break;
					}
					
					if(text[this.pos]!=','){
						throw this.expected(text,"(",',');
					}
					++this.pos;
					++this.col;
				}
			}
			++this.pos;
			++this.col;
			
			this.space(text);
			
			if(text[this.pos]=="("){
				++this.pos;
				++this.col;
				
				while(text[this.pos]!=")"){
					if(!this.parse_code(text) && !this.parse_assign(text)){
						throw new ParseError(
							"Expected an assignment",this.line,this.col
						);
					}
				}
				++this.pos;
				++this.col;
			}
			
			if(text[this.pos]!=":"){
				throw this.expected(text,":");
			}
			++this.pos;
			++this.col;
			
			this.space(text);
			
			var next=this.parse_name(text);
			this.space(text);
			
			if(text[this.pos]!="("){
				throw this.expected(text,"(");
			}
			++this.pos;
			++this.col;
			this.space(text);
			
			var block={};
			for(var i=params.length;i--;){
				var p=params[i];
				block[p.name]=p.obj;
			}
			
			this.scopify(block);
			
			var args=[];
			if(text[this.pos]!=")"){
				for(;;){
					this.space(text);
					
					var val=this.parse_value(text);
					if(!val){
						throw new ParseError(
							"Expected value",this.line,this.col
						);
					}
					args.push(val);
					
					this.space(text);
					
					if(text[this.pos]==")"){
						break;
					}
					
					if(text[this.pos]!=','){
						throw this.expected(text,")",',')
					}
					++this.pos;
					++this.col;
				}
			}
			++this.pos;
			++this.col;
			
			var code=glu.code(
				params.map(function(v){return v.obj;}),
				this.getvar(next),args
			);
			
			this.descopify();
			
			return code;
		}
	};
	
	function parse(text,globals){
		var ps=new ParserState(globals),tl=text.length,entry=null;
		
		while(ps.pos<tl){
			ps.space(text,ps);
			if(!ps.parse_assign(text)){
				entry=ps.parse_code(text);
			}
		}
		
		var names=Object.keys(ps.unresolved);
		if(names.length){
			throw new Error("Unresolved symbol(s) "+names.join(", "));
		}
		
		return entry;
	}
	
	return {
		ParseError:ParseError,
		parse:parse
	};
})();
