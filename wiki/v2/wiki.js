var wiki=(function(){
	'use strict';
	
	function htmlify(x){
		return x.replace(/["'<&>]/g,function(m){
			return {
				"<":"&lt;",
				"&":"&amp;",
				">":"&gt;",
				'"':"&quot;",
				"'":"&apos;"
			}[m];
		});
	}
	
	/**
	 * Plain text, no strings attached. Simplifies logic that would otherwise
	 *  have to check for plain strings.
	 *
	 * @param text The content of the plaintext.
	**/
	function Plaintext(text){
		this.text=text;
	}
	Plaintext.prototype={
		constructor:Plaintext,
		toString:function(){
			return this.text;
		},
		toHTML:function(){
			return htmlify(this.text);
		},
		visit:function(visitor,data){
			return visitor.visit("plain",this,data);
		}
	};
	
	/**
	 * An XML entity.
	 *
	 * @param name A string indicating the name of the entity, e.g. &name;
	**/
	function Entity(name){
		this.name=name;
	}
	Entity.prototype={
		constructor:Entity,
		toString:function(){
			return "&"+this.name+";";
		},
		toHTML:function(context){
			return context.entity(this.name);
		},
		visit:function(visitor,data){
			return visitor.visit("entity",this,data);
		}
	};
	
	/**
	 * A collection of wiki items.
	**/
	function Paragraph(content){
		this.content=content;
	}
	Paragraph.prototype={
		constructor:Paragraph,
		toString:function(){
			return this.content.join("");
		},
		toHTML:function(context){
			var s="<p>",content=this.content,cl=content.length;
			for(var i=0;i<cl;++i){
				s+=content[i].toHTML(context);
			}
			return s+"</p>";
		},
		visit:function(visitor,data){
			return visitor.visit("paragraph",data);
		}
	};
	
	/**
	 * Given a string delineated by other means from the article, produce
	 *  a list of Plaintext and Entity objects.
	**/
	function entity_text(text){
		var ENTITY=/&([-\w]+);/g,x=0,v=[],m;
		while(m=ENTITY.exec(text)){
			var t=text.slice(x,m.index);
			if(t){
				v.push(new Plaintext(t));
			}
			
			v.push(new Entity(m[1]));
			x=m.index+m[0].length;
		}
		
		var t=text.slice(x);
		if(t){
			v.push(new Plaintext(t));
		}
		
		return v;
	}
	
	/**
	 * Text which contains only plaintext and XML entities. This is used for
	 *  section header text and XML attribute values.
	 *
	 * @param content An array containing Plaintext and Entity objects.
	**/
	function EntityText(content){
		if(typeof content=="string"){
			content=entity_text(content);
		}
		this.content=content;
	}
	EntityText.prototype={
		constructor:EntityText,
		toString:function(){
			return this.content.join("");
		},
		toHTML:function(context){
			var s="",content=this.content,cl=content.length;
			for(var i=0;i<cl;++i){
				s+=content[i].toHTML(context);
			}
			
			return s;
		},
		visit:function(visitor,data){
			return visitor.visit("entitytext",this,data);
		}
	};
	
	/**
	 * A link to an external website.
	**/
	function Link(url,display){
		this.url=new EntityText(url);
		this.display=new EntityText(display||"");
	}
	Link.prototype={
		constructor:Link,
		toString:function(){
			var d=this.display.toString();
			if(d){
				return "["+this.url+" "+d+"]";
			}
			return "["+this.url+"]";
		},
		toHTML:function(context){
			var d=this.display.toString(),
				u=this.url.toHTML(context).replace(/"'/g,function(v){
					return {'"':"&quot;","'":"&apos;"}[v];
				});
			if(d){
				return '<a href="'+u+'">'+this.display.toHTML(context)+'</a>';
			}
			return '<a href="'+u+'">'+u+'</a>';
		},
		visit:function(visitor,data){
			return visitor.visit("link",this,data);
		}
	};
	
	/**
	 * A link to an external website.
	**/
	function PageLink(params,tail){
		this.params=params.map(function(v){
			return new EntityText(v);
		});
		this.tail=tail;
	}
	PageLink.prototype={
		constructor:PageLink,
		toString:function(){
			return "[["+this.params.join("|")+"]]"+this.tail;
		},
		toHTML:function(context){
			return context.pagelink(this);
		},
		visit:function(visitor,data){
			return visitor.visit("pagelink",this,data);
		}
	};
	
	/**
	 * An unprocessed template.
	**/
	function Template(params){
		this.params=params||[];
	}
	Template.prototype={
		constructor:Template,
		toString:function(){
			return "{{"+this.params.join("|")+"}}";
		},
		toHTML:function(context){
			return '<a href>Template:'+this.params[0]+'</a>';
		},
		visit:function(visitor,data){
			return visitor.visit("template",this.data);
		}
	};
	
	/**
	 * An unprocessed template parameter.
	**/
	function TemplateParam(params){
		this.params=params||[];
	}
	TemplateParam.prototype={
		constructor:TemplateParam,
		toString:function(){
			return "{{{"+this.params.join("|")+"}}}";
		},
		toHTML:function(context){
			return '<strong>'+this+'</strong>';
		},
		visit:function(visitor,data){
			return visitor.visit("templateparam",this.data);
		}
	};
	
	/**
	 * Single-quoted bold style.
	**/
	function Bold(content,terminate){
		this.content=content;
		this.terminate=!!terminate;
	}
	Bold.prototype={
		constructor:Bold,
		toString:function(){
			return "'''"+this.content.join("")+(this.terminate?"'''":"");
		},
		toHTML:function(context){
			var s='<b>',content=this.content,cl=content.length;
			for(var i=0;i<cl;++i){
				s+=content[i].toHTML(context);
			}
			return s+'</b>';
		},
		visit:function(visitor,data){
			return visitor.visit("bold",data);
		}
	};
	
	/**
	 * Single-quoted italic style.
	**/
	function Italic(content,terminate){
		this.content=content;
		this.terminate=!!terminate;
	}
	Italic.prototype={
		constructor:Italic,
		toString:function(){
			return "''"+this.content.join("")+(this.terminate?"''":"");
		},
		toHTML:function(context){
			var s='<i>',content=this.content,cl=content.length;
			for(var i=0;i<cl;++i){
				s+=content[i].toHTML(context);
			}
			return s+'</i>';
		},
		visit:function(visitor,data){
			return visitor.visit("italic",data);
		}
	};
	
	function Comment(text){
		this.text=text;
	}
	Comment.prototype={
		constructor:Comment,
		toString:function(){
			return "<!--"+this.text+"-->";
		},
		toHTML:function(){
			return "<!--"+this.text+"-->";
		},
		visit:function(visitor,data){
			return visitor.visit("comment",data);
		}
	};
	
	function Tag(name,attrs,content){
		this.name=name;
		this.attrs=attrs;
		this.content=content;
	}
	Tag.prototype={
		constructor:Tag,
		toString:function(){
			var s="<"+name,content=this.content,cl=content.length;
			
			for(var a in attrs){
				s+=" ";
				s+=a;
				s+="=";
				s+=attrs[a];
			}
			
			if(content===null){
				return s+"/>";
			}
			if(content===false){
				return s+">";
			}
			
			return s+content.join("");
		},
		toHTML:function(context){
			return context.tag(this);
		},
		visit:function(visitor,data){
			return visitor.visit("tag",data);
		}
	};
	
	/**
	 * Returns the elements of the wiki list as an array of strings.
	**/
	function stringifyList(t,x){
		if(x instanceof List || x instanceof DefList){
			var v=[],content=x.content,cl=content.length;
			for(var i=0;i<cl;++i){
				var n=stringifyList(t,content[i]),nl=n.length;
				for(var j=0;j<nl;++j){
					n[j]=t+n[j];
				}
				
				Array.prototype.push.apply(v,n);
			}
			
			return v;
		}
		
		return [x.toString()];
	}
	
	/**
	 * A list which may contain sublists.
	**/
	function List(type,content){
		this.type=type||"*";
		this.content=content;
	}
	List.prototype={
		constructor:List,
		toString:function(){
			var s="",v=stringifyList(this.type,this),vl=v.length-1;
			for(var i=0;i<=vl;++i){
				s+=this.type;
				s+=v[i];
				s+="\n";
			}
			
			return s+this.type+v[i];
		},
		toHTML:function(context){
			var content=this.content,
				tag={"*":"ul","#":"ol",";":"dt",":":"dd"}[this.type];
			
			if(tag=="dt" || tag=="dd"){
				var s="",cl=content.length;
				for(var i=0;i<cl;++i){
					s+=content[i].toHTML(context);
				}
				return "<"+tag+">"+s+"</"+tag+">";
			}
			
			var s="<li>",cl=content.length-1;
			
			for(var i=0;i<cl;++i){
				var c=content[i],h=c.toHTML(context);
				if(c instanceof List || c instanceof DefList){
					s+=h+"</li><li>";
				}
				else{
					var ci1=content[i+1];
					if(ci1 instanceof List || ci1 instanceof DefList){
						s+=h;
					}
					else{
						s+=h+"</li><li>";
					}
				}
			}
			
			return "<"+tag+">"+s+content[i].toHTML(context)+"</li></"+tag+">";
		},
		visit:function(visitor,data){
			return visitor.visit("list",data);
		}
	};
	
	/**
	 * Special list type for holding definition lists which have subtly
	 *  different semantics.
	**/
	function DefList(content){
		this.content=content;
	}
	DefList.prototype={
		constructor:DefList,
		toString:function(){
			var s="",v=stringifyList("",this),vl=v.length-1;
			for(var i=0;i<=vl;++i){
				s+=v[i];
				s+="\n";
			}
			
			return s+v[i];
		},
		toHTML:function(context){
			var content=this.content,cl=content.length,s="<dl>";
			
			for(var i=0;i<cl;++i){
				s+=content[i].toHTML(context);
			}
			
			return s+"</dl>";
		},
		visit:function(visitor,data){
			return visitor.visit("deflist",data);
		}
	};
	
	/**
	 * The article that contains all the other wikitext.
	**/
	function Article(){
		this.content=[];
		this.subsections=[];
	}
	Article.prototype={
		constructor:Article,
		toString:function(){
			return this.content.join("\n\n")+this.subsections.join("");
		},
		toHTML:function(context){
			var html="",content=this.content,cl=content.length;
			for(var i=0;i<cl;++i){
				html+=content[i].toHTML(context);
			}
			
			var sub=this.subsections,sl=sub.length;
			for(var i=0;i<sl;++i){
				html+=sub[i].toHTML(context);
			}
			
			return html;
		},
		visit:function(visitor,data){
			return visitor.visit("article",this,data);
		}
	};
	
	/**
	 * A section of wikitext.
	 *
	 * @param level An integer indicating the level of the section.
	 * @param text The text of the section's header.
	**/
	function Section(level,text){
		this.level=level;
		this.text=new EntityText(text);
		this.content=[];
		this.subsections=[];
	}
	Section.prototype={
		constructor:Section,
		toString:function(){
			console.log(this.content)
			var level="======".slice(0,this.level);
			return level+this.text+level+"\n"+this.content.join("\n\n");
		},
		toHTML:function(context){
			var tag="h"+this.level+">";
			var html="<"+tag+this.text.toHTML(context)+"</"+tag;
			
			var content=this.content,cl=content.length;
			for(var i=0;i<cl;++i){
				html+=content[i].toHTML(context);
			}
			
			var sub=this.subsections,sl=sub.length;
			for(var i=0;i<sl;++i){
				html+=sub[i].toHTML(context);
			}
			
			return html;
		},
		visit:function(visitor,data){
			return visitor.visit("section",this,data);
		}
	};
	
	function Break(size){
		this.size=size;
	}
	Break.prototype={
		constructor:Break,
		visit:function(visitor,data){
			return visitor.visit("break",this,data);
		},
		toString:typeof String.prototype.repeat=="function"?
			//Probably faster, not 100% supported
			function(){
				return "-".repeat(this.size);
			}:
			//Compatible backup
			function(){
				var s="-",x=this.size;
				while(--x){
					s+="-";
				}
				return s;
			},
		toHTML:function(){
			return "<hr/>";
		}
	};
	
	function Preformatted(content){
		var v=[],cl=content.length,left=content[0];
		for(var i=1;i<cl;++i){
			var right=content[i];
			if(left instanceof Plaintext && right instanceof Plaintext){
				left.text+=right.text;
				continue;
			}
			v.push(left);
			left=right;
		}
		v.push(left);
		
		this.content=v;
	}
	Preformatted.prototype={
		constructor:Preformatted,
		visit:function(visitor,data){
			return visitor.visit("pre",this,data);
		},
		toString:function(){
			return this.content.toString();
		},
		toHTML:function(context){
			return '<pre>'+this.content.map(function(v){
				return v.toHTML(context);
			}).join("")+'</pre>';
		}
	};
	
	function parse_rule(detect,parse){
		return {detect:detect,parse:parse};
	}
	
	var EOL=/$/gm,
		SECTION=/^(={1,6})(.+?)(={1,6})$/gm;
	/**
	 * A parser/parser state for parsing wikitext.
	**/
	function Parser(start,body){
		this.pos=0;
		this.sections=null;
		this.section_content=null;
		
		this.start=start;
		this.body=body;
		
		this.data=null;
	}
	Parser.prototype={
		constructor:Parser,
		/**
		 * Add the given object to the current section's content. If it's a
		 *  string, either append it to the top plaintext object or create a
		 *  new one
		**/
		add:function(o){
			var sc=this.section_content,top=sc.length-1,ol=o.length;
			for(var i=0;i<ol;++i){
				var v=o[i];
				if(typeof v=="string"){
					if(sc[top] instanceof Plaintext){
						sc[top].text+=v;
					}
					else{
						sc.push(new Plaintext(v));
						++top;
					}
				}
				else{
					this.section_content.push(v);
				}
			}
		},
		/**
		 * Try to parse a token described by the given regex, else return null.
		 *
		 * @param text The text to parse.
		 * @param r The token's regex.
		 * @param ps The parser state.
		**/
		maybe:function(text,r){
			r.lastIndex=this.pos;
			var m=r.exec(text);
			//Make sure it's at the expected position
			if(m && m.index==this.pos){
				this.pos+=m[0].length;
				return m;
			}
			return null;
		},
		/**
		 * Try to parse a section header, return true if successful.
		**/
		parse_section:function(text,context){
			var m=this.maybe(text,SECTION);
			if(m){
				//Special case for sections with no obvious header text
				if(/^=+$/.test(m[0])){
					//Sections must have header text, which will either be =
					// for odd or == for even. L is used to adjust the level to
					// match this.
					//L>>1 = Math.floor(L/2)
					var L=Math.min(m[0].length,14),level=(L>>1)-!(L%2),
						ht=m[0].slice(level,-level);
				}
				else{
					var level=Math.min(m[1].length,m[3].length),
						ht=m[2];
				}
				
				var h=new Section(level,ht),
					secs=this.sections,sl=secs.length;
				//Pop the sections in the context until the section can be 
				// added.
				while(secs[--sl].level>=level){
					secs.pop();
				}
				secs.push(h);
				secs[sl].subsections.push(h);
				this.section_content=h.content;
				++this.pos;
				return true;
			}
			
			return false;
		},
		/**
		 * Parse all the patterns which can only occur at the start of a line
		 *  and return true if something was parsed - all start-of-line
		 *  patterns are expected to consume the entire line.
		**/
		parse_start:function(text,context){
			var s=this.start,sl=s.length;
			while(sl--){
				var o=s[sl].call(this,text,context);
				if(o){
					return o;
				}
			}
			
			return null;
		},
		/**
		 * Generalized method for parsing sequential body elements within a
		 *  block
		**/
		parse_content:function(text,context,lookout){
			var b=this.body,bl=b.length,tl=text.length,v=[],s=this.pos,
				lx=lookout(this,text,context);
			
			consume_body:
			do{				
				var i=bl,pending=[],p=this.pos;
				while(i--){
					var x=b[i].detect(this,text,context);
					
					if(x<0){
						continue;
					}
					//Current position is the smallest it can go - immediately
					// try to parse it
					else if(x==p){
						var o=b[i].parse(this,text,context);
						if(o){
							v=v.concat(o);
							
							if(this.pos==lx){
								return v;
							}
							else if(this.pos>lx){
								lx=lookout(this,text,context);
								if(lx<0){
									//Abort - can't find the lookout
									this.pos=s;
									return null;
								}
								else if(lx==this.pos){
									return v;
								}
							}
							
							continue consume_body;
						}
						this.pos=p;
					}
					else{
						pending.push({parse:b[i].parse,x:x});
					}
				}
				
				if(!pending.length){
					if(p<lx){
						v.push(new Plaintext(text.slice(p,lx)));
					}
					this.pos=lx;
					return v;
				}
				
				//Add the lookout to pending in case it's encountered
				pending.push({parse:null,x:lx});
				
				//Sort pending so the closest elements are tested first
				pending.sort(function(a,b){
					return a.x-b.x;
				});
				
				var i=pending.length;
				while(i--){
					var tp=this.pos=pending[i].x,parse=pending[i].parse;
					
					//Done
					if(!parse){
						if(p<tp){
							v.push(new Plaintext(text.slice(p,tp)));
						}
						this.pos=tp;
						return v;
					}
					
					var o=parse(this,text,context);
					if(o){
						if(p<tp){
							v.push(new Plaintext(text.slice(p,tp)));
						}
						v=v.concat(o);
						
						if(this.pos==lx){
							return v;
						}
						else if(this.pos>lx){
							lx=lookout(this,text,context);
							if(lx<0){
								//Abort - can't find the lookout
								this.pos=s;
								return null;
							}
							else if(lx==this.pos){
								return v;
							}
						}
						
						continue consume_body;
					}
				}
				
				throw new Error("This shouldn't ever be reached");
			}while(this.pos<tl);
			
			return v;
		},
		/**
		 * Parse anything that doesn't occur at the start of a line.
		 *  Individually these need not consume the entire line, but this
		 *  function loops until they do.
		**/
		parse_body:function(text,context){
			var body=this.parse_content(text,context,function(ps,text){
				EOL.lastIndex=ps.pos;
				EOL.test(text);
				return EOL.lastIndex;
			});
			
			if(!body){
				throw new Error("Null body!");
			}
			
			return body;
		},
		/**
		 * Main parse function.
		**/
		parse:function(text,context){
			//Normalize the article source
			text=text.
				replace(/\r\n?|[\n\x85\v\f\u2028\u2029]/g,'\n').
				replace(/[\x00-\t\x0b-\x1f]/g,"");
			
			var article=new Article();
			this.pos=0;
			this.sections=[article];
			this.section_content=article.content;
			this.data={};
			
			context=context||{};
			context={
				parse_start:context.parse_start||function(){},
				parse_body:context.parse_body||function(){}
			};
			
			var tl=text.length,p=[];
			do{
				if(this.parse_section(text,context)){
					continue;
				}
				
				var v=this.parse_start(text,context);
				if(v){
					this.add(v);
					continue;
				}
				
				var body=this.parse_body(text,context);
				if(text.indexOf("\n\n")==this.pos){
					while(text[++this.pos]=='\n'){}
					
					p=p.concat(body);
					this.section_content.push(new Paragraph(p));
					p=[];
				}
				else{
					p=p.concat(body);
					++this.pos;
				}
				
				//Incrementing parser.pos because a newline must have been
				// encountered - regex doesn't consume newlines for end-of-line
				// anchors
			}while(this.pos<tl);
			
			if(p.length){
				this.section_content.push(new Paragraph(p));
			}
			
			return article;
		}
	};
	
	/**
	 * Try to parse a page break (horizontal line), else return null.
	**/
	var BREAK=/^-{4,}$/gm;
	function parse_break(text,context){
		var m=this.maybe(text,BREAK);
		return m && [new Break(m[0].length)];
	}
	
	/**
	 * Try to parse a preformatted block.
	**/
	function parse_pre(text,context){
		if(text[this.pos]==' '){
			var v=this.parse_body(text,context);
			while(text[++this.pos]==' '){
				++this.pos;
				v.push(new Plaintext("\n "));
				var x=this.parse_body(text,context);
				v=v.concat(x);
			}
			
			return [new Preformatted(v)];
		}
		return null;
	}
	
	/**
	 * Try to parse a list.
	**/
	var LIST_START=/^[#*;:]+/gm;
	function parse_list(text,context){
		function isdef(x){
			return x==";" || x==":";
		}
		
		//Lists list the unfinished lists which are to be added to their
		// parent once finished
		var lists=[],type="",tl=0,m=null;
		while(m=this.maybe(text,LIST_START)){
			var tt=m[0],ttl=tt.length,L=Math.min(tl,ttl);
			//Find the number of equal characters to the left
			for(var i=0;i<L && type[i]==tt[i];++i){}
			
			//Process the lists that have ended
			tl-=i;
			while(tl-- && lists.length>1){
				if(lists[lists.length-2] instanceof DefList){
					var tc=lists[lists.length-2].content;
					
					tc[tc.length-1].content.push(lists.pop());
				}
				else{
					lists[lists.length-2].content.push(lists.pop());
				}
			}
			
			if(lists.length){
				var tc=lists[lists.length-1].content,
					tct=tc[tc.length-1];
				if(tct instanceof DefList && (tt[i]==";" || tt[i]==":")){
					tct.content.push(new List(tt[i++],[]));
				}
			}
			
			//Add lists based on the new types
			for(;i<ttl;++i){
				var tti=tt[i];
				if(tti==';' || tti==":"){
					lists.push(new DefList([new List(tt[i],[])]));
				}
				else{
					lists.push(new List(tt[i],[]));
				}
			}
			
			//Give the last list the body of the line
			var top=lists[lists.length-1];
			if(top instanceof DefList){
				var tc=top.content;
				
				tc[tc.length-1].content.push(
					new Paragraph(this.parse_body(text,context))
				);
			}
			else{
				top.content.push(
					new Paragraph(this.parse_body(text,context))
				);
			}
			++this.pos;
			
			type=tt;
			tl=ttl;
		}
		
		if(lists.length){
			while(lists.length>1){
				lists[lists.length-2].content.push(lists.pop());
			}
			
			return [lists[0]];
		}
		return null;
	}
	
	/**
	 * Consume a XML-esque entity.
	**/
	var ENTITY=/&([^\s;]+);/g;
	var parse_entity=parse_rule(
		function(ps,text,context){
			return text.indexOf("&",ps.pos);
		},
		function(ps,text,context){
			var m=ps.maybe(text,ENTITY);
			if(m){
				return [new Entity(m[1])];
			}
			
			return null;
		}
	);
	
	/**
	 * Parse either an external link or a link to another page on the wiki.
	**/
	var PAGELINK=/\[\[([^|]*(?:\|[^|]*)*)\]\](\w*)/gm,
		LINK=new RegExp("\\[\\s*("+
			//URL portion
			"(?:[a-z]+://)?"+ //Protocol
			"(?:\\S+@)?"+ //Email
			"[^\\s./@:]+(?:\\.[^\\s./@:]+)+"+ //Domain
			"(?::\\d+)?"+ //Port
			"(?:/(?:%[a-f0-9]|[^\\s&#?])*)*/?"+ //Path
			"(?:\\?[^#]+)?"+ //Query
			"(?:#\\S+)?"+ //Anchor
		//Display portion
		")\\s*(\\S*?)\\s*\]","gim");
	var parse_link=parse_rule(
		function(ps,text,context){
			return text.indexOf("[",ps.pos);
		},
		function(ps,text,context){
			var m=ps.maybe(text,PAGELINK);
			if(m){
				return [new PageLink(m[1].split("|"),m[2])];
			}
			
			//Need to match URLs specifically so ordinary uses of [...]
			// aren't given false positives
			m=ps.maybe(text,LINK);
			if(m){
				return [new Link(m[1],m[2])];
			}
			
			return null;
		}
	);
	
	/**
	 * Parse an unprocessed template. Note that this doesn't recognize
	 *  any templates within it.
	**/
	var TPL=/\{\{\{([^{}]*)\}\}\}|\{\{([^{}]*)\}\}/g;
	var parse_template=parse_rule(
		function(ps,text,context){
			TPL.lastIndex=ps.pos;
			var m=TPL.exec(text);
			return m?m.index:-1;
		},
		function(ps,text,context){
			var m=ps.maybe(text,TPL);
			if(m[1]){
				return [new TemplateParam(m[1].split("|"))];
			}
			
			if(m[2]){
				return [new Template(m[2].split("|"))];
			}
			
			return null;
		}
	);
	
	/**
	 * Parse the single-quote italics.
	**/
	var parse_italic=parse_rule(
		function(ps,text,context){
			if(ps.data.parsing_sq2){
				return -1;
			}
			
			return text.indexOf("''",ps.pos);
		},
		function(ps,text,context){
			if(text.indexOf("''",ps.pos)==ps.pos){
				ps.pos+=2;
				ps.data.parsing_sq2=true;
				
				var v=ps.parse_content(text,context,function(ps,text){
					var x=text.indexOf("''",ps.pos);
					if(x<0){
						SECTION.lastIndex=ps.pos;
						var m=SECTION.exec(text);
						if(m){
							return m.index;
						}
						
						EOL.lastIndex=ps.pos;
						EOL.test(text);
						
						return EOL.lastIndex;
					}
					
					return x;
				});
				
				ps.data.parsing_sq2=false;
				
				if(v){
					SECTION.lastIndex=ps.pos;
					var m=SECTION.exec(text),e=false;
					if(m && this.pos<m.index){
						ps.pos+=2;
						e=true;
					}
					
					if(v.length){
						return [new Italic(v,e)];
					}
					if(e){
						return [new Plaintext("''''")];
					}
					return [new Plaintext("''")];
				}
			}
			
			return null;
		}
	);
	
	/**
	 * Single-quoted bold.
	**/
	var parse_bold=parse_rule(
		function(ps,text,context){
			if(ps.data.parsing_sq3){
				return -1;
			}
			
			return text.indexOf("'''",ps.pos);
		},
		function(ps,text,context){
			if(text.indexOf("'''",ps.pos)==ps.pos){
				ps.pos+=3;
				ps.data.parsing_sq3=true;
				
				var v=ps.parse_content(text,context,function(ps,text){
					var x=text.indexOf("'''",ps.pos);
					if(x<0){
						SECTION.lastIndex=ps.pos;
						var m=SECTION.exec(text);
						if(m){
							return m.index;
						}
						
						EOL.lastIndex=ps.pos;
						EOL.test(text);
						
						return EOL.lastIndex;
					}
					
					return x;
				});
				
				ps.data.parsing_sq3=false;
				
				if(v){
					SECTION.lastIndex=ps.pos;
					var m=SECTION.exec(text),e=false;
					if(m && ps.pos<m.index){
						ps.pos+=3;
						e=true;
					}
					
					if(v.length){
						return [new Bold(v,e)];
					}
					if(e){
						return [new Plaintext("''''''")];
					}
					return [new Plaintext("'''")];
				}
			}
			
			return null;
		}
	);
	
	/**
	 * All the XML rules other than the entities.
	**/
	var XML_START=new RegExp(
			"<\\s*([-:\\w]+)\\s*"+
			"((?:[-:\\w]+\\s*=\\s*"+
				"(?:\"[^\"]*\"|'[^']'|`[^`]`|[^\\s=\"'`])"+
			"\\s*))+(/)?>","g"
		),
		XML_ATTR=
			/([-:\w]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`|([^\s="'`]))/,
		XML_END=/<\s*([-:\w]+)\s*>/g,
		XML_COMMENT=/<!--(.*?)-->/g,
		SPACE=/\s+/g;
	var parse_xml=parse_rule(
		function(ps,text,context){
			return text.indexOf("<");
		},
		function(ps,text,context){
			var m=this.maybe(text,XML_COMMENT);
			if(m){
				return new Comment(m[1]);
			}
			
			if(m=this.maybe(text,XML_START)){
				var name=m[1],attrs={},av=m[2].trim().split(SPACE);
				for(var i=av.length;i--;){
					var am=XML_ATTR.exec(text);
					attrs[am[1]]=am[2]||am[3]||am[4]||am[5];
				}
				
				if(m[3]){
					return new Tag(name,attrs,null);
				}
				
				if(context.improper_tag(name)){
					return new Tag(name,attrs,false);
				}
				
				var v=ps.parse_content(text,context,function(ps,text){
					var m;
					XML_END.lastIndex=ps.pos;
					while(m=XML_END.exec(text)){
						if(m[1]==name){
							return m.index;
						}
					}
					
					SECTION.lastIndex=ps.pos;
					if(m=SECTION.exec(text)){
						return m.index;
					}
					
					EOL.lastIndex=ps.pos;
					EOL.test(text);
					
					return EOL.lastIndex;
				});
				
				this.maybe(text,XML_END);
				
				return new Tag(name,attrs,v);
			}
			
			return null;
		}
	);
	
	function preprocess(text,context){
		context=context||{};
		context={
			template:context.template||function(params){
				return "{{"+params.join("|")+"}}";
			},
			template_param:context.template_param||function(params){
				if(params.length>1){
					return params.slice(1).join("|");
				}
				return null;
			}
		}
		
		//tplstack stores both templates and parameters as positive and
		// negative indices, respectively, after all open braces in order of
		// which need to be evaluated first
		var tplstack=[],x=0;
		for(;;){
			var i=text.indexOf("{{",x),
				j=text.indexOf("}}",x);
			//If there aren't any more relevant tokens, we're done
			if(i<0 && j<0){
				break;
			}
			
			//If the next relevant token is }}
			if(j>=0 && j<i || i<0){
				x=j+1;
				//Closing token only matters if there's a corresponding
				// opening token
				if(tplstack.length){
					var s=tplstack.pop();
					++x;
					
					//If it's a template parameter
					if(s<0){
						s=-s;
						if(text[x]=="}"){
							++x;
							var tp=context.template_param(
								text.slice(s,x-3).split("|")
							);
							
							//Splice the processed parameter back into the
							// text
							if(typeof tp=="string"){
								text=text.slice(0,s-3)+tp+text.slice(x);
								x=s+tp.length-3;
							}
							continue;
						}
					}
					
					var tpl=context.template(
						text.slice(s,x-2).split("|")
					);
					
					//Spliced the processed template back into the text
					if(typeof tpl=="string"){
						text=text.slice(0,s-2)+tpl+text.slice(x);
						x=s+tpl.length-2;
					}
				}
			}
			else{
				x=i+1;
				//Template parameters are stored as negative indices
				if(text[++x]=="{"){
					tplstack.push(-++x);
				}
				else{
					tplstack.push(x);
				}
			}
		}
		
		return text;
	}
	
	var MWParser=new Parser([
			parse_break,
			parse_pre,
			parse_list
		],[
			parse_italic,
			parse_bold,
			parse_entity,
			parse_link,
			parse_template
		]);
	
	return {
		"Plaintext":Plaintext,
		"Article":Article,
		"Section":Section,
		"Parser":Parser,
		"parse":function(text,context){
			return MWParser.parse(text,context);
		},
		"preprocess":preprocess,
		"toHTML":function(x,context){
			context=context||{};
			context={
				tag:context.tag||function(tag){
					return tag.toString();
				},
				entity:context.entity||function(name){
					return "&"+name+";";
				},
				pagelink:context.pagelink||function(link){
					var p=/([^#]+)#?(.+)?$/.exec(link.params[0]),
						u=htmlify(p[1]),
						d=link.params[1];
					
					if(p[2]){
						var a=htmlify(p[2]);
						if(d){
							return '<a href="/wiki/'+u+"#"+a+'">'+
								d.toHTML(this)+link.tail+'</a>';
						}
						return '<a href="/wiki/'+u+"#"+a+'">'+
							u+" \u00a7 "+a+link.tail+'</a>';
					}
					
					if(d){
						return '<a href="/wiki/'+u+'">'+
							d.toHTML(this)+link.tail+'</a>';
					}
					
					return '<a href="/wiki/'+u+'">'+u+link.tail+'</a>';
				}
			}
			
			return x.toHTML(context);
		}
	};
})();