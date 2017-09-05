/*
var wiki=(function(){
//*/
	'use strict';
	
	//Big-ol' list of HTML entity bindings for context defaults
	var HTML_ENTITIES={
		quot:'"',amp:"&",apos:"'",lt:"<",gt:">",nbsp:"\xA0",iexcl:"\xA1",
		cent:"\xA2",pound:"\xA3",curren:"\xA4",yen:"\xA5",brvbar:"\xA6",
		sect:"\xA7",uml:"\xA8",copy:"\xa9",ordf:"\xaa",laquo:"\xAB",not:"\xAC",
		shy:"\xAD",reg:"\xAE",macr:"\xAF",deg:"\xB0",plusmn:"\xB1",sup2:"\xB2",
		sup3:"\xB3",acute:"\xB4",micro:"\xB5",para:"\xB6",middot:"\xB7",
		cedil:"\xB8",sup1:"\xB9",ordm:"\xBA",raquo:"\xBB",frac14:"\xBC",
		frac12:"\xBD",frac34:"\xBE",iquest:"\xBF",Agrave:"\xC0",Aacute:"\xC1",
		Acirc:"\xC2",Atilde:"\xC3",Auml:"\xC4",Aring:"\xC5",AElig:"\xC6",
		Ccedil:"\xC7",Egrave:"\xC8",Eacute:"\xC9",Ecirc:"\xCA",Euml:"\xCB",
		Igrave:"\xCC",Iacute:"\xCD",Icirc:"\xCE",Iuml:"\xCF",ETH:"\xD0",
		Ntilde:"\xD1",Ograve:"\xD2",Oacute:"\xD3",Ocirc:"\xD4",Otilde:"\xD5",
		Ouml:"\xD6",times:"\xD7",Oslash:"\xD8",Ugrave:"\xD9",Uacute:"\xDA",
		Ucirc:"\xDB",Uuml:"\xDC",Yacute:"\xDD",THORN:"\xDE",szlig:"\xDF",
		agrave:"\xE0",aacute:"\xE1",acirc:"\xE2",atilde:"\xE3",auml:"\xE4",
		aring:"\xE5",aelig:"\xE6",ccedil:"\xE7",egrave:"\xE8",eacute:"\xE9",
		ecirc:"\xEA",euml:"\xEB",igrave:"\xEC",iacute:"\xED",icirc:"\xEE",
		iuml:"\xEF",eth:"\xF0",ntilde:"\xF1",ograve:"\xF2",oacute:"\xF3",
		ocirc:"\xF4",otilde:"\xF5",ouml:"\xF6",divide:"\xF7",oslash:"\xF8",
		ugrave:"\xF9",uacute:"\xFA",ucirc:"\xFB",uuml:"\xFC",yacute:"\xFD",
		thorn:"\xFE",yuml:"\xFF",OElig:"\u0152",oelig:"\u0153",Scaron:"\u0160",
		scaron:"\u0161",Yuml:"\u0178",fnof:"\u0192",circ:"\u02C6",
		tilde:"\u02DC",Alpha:"\u0391",Beta:"\u0392",Gamma:"\u0393",
		Delta:"\u0394",Epsilon:"\u0395",Zeta:"\u0396",Eta:"\u0397",
		Theta:"\u0398",Iota:"\u0399",Kappa:"\u039A",Lambda:"\u039B",
		Mu:"\u039C",Nu:"\u039D",Xi:"\u039E",Omicron:"\u039F",Pi:"\u03A0",
		Rho:"\u03A1",Sigma:"\u03A3",Tau:"\u03A4",Upsilon:"\u03A5",Phi:"\u03A6",
		Chi:"\u03A7",Psi:"\u03A8",Omega:"\u03A9",alpha:"\u03B1",beta:"\u03B2",
		gamma:"\u03B3",delta:"\u03B4",epsilon:"\u03B5",zeta:"\u03B6",
		eta:"\u03B7",theta:"\u03B8",iota:"\u03B9",kappa:"\u03BA",
		lambda:"\u03BB",mu:"\u03BC",nu:"\u03BD",xi:"\u03BE",omicron:"\u03BF",
		pi:"\u03C0",rho:"\u03C1",sigmaf:"\u03C2",sigma:"\u03C3",tau:"\u03C4",
		upsilon:"\u03C5",phi:"\u03C6",chi:"\u03C7",psi:"\u03C8",omega:"\u03C9",
		thetasym:"\u03D1",upsih:"\u03D2",piv:"\u03D6",ensp:"\u2002",
		emsp:"\u2003",thinsp:"\u2009",zwnj:"\u200C",zwj:"\u200D",lrm:"\u200E",
		rlm:"\u200F",ndash:"\u2013",mdash:"\u2014",lsquo:"\u2018",
		rsquo:"\u2019",sbquo:"\u201A",ldquo:"\u201C",rdquo:"\u201D",
		bdquo:"\u201E",dagger:"\u2020",Dagger:"\u2021",bull:"\u2022",
		hellip:"\u2026",permil:"\u2030",prime:"\u2032",Prime:"\u2033",
		lsaquo:"\u2039",rsaquo:"\u203A",oline:"\u203E",frasl:"\u2044",
		euro:"\u20AC",image:"\u2111",weierp:"\u2118",real:"\u211C",
		trade:"\u2122",alefsym:"\u2135",larr:"\u2190",uarr:"\u2191",
		rarr:"\u2192",darr:"\u2193",harr:"\u2194",crarr:"\u21B5",lArr:"\u21D0",
		uArr:"\u21D1",rArr:"\u21D2",dArr:"\u21D3",hArr:"\u21D4",diams:"\u2666",
		forall:"\u2200",part:"\u2202",exist:"\u2203",empty:"\u2205",
		nabla:"\u2207",isin:"\u2208",notin:"\u2209",ni:"\u220B",prod:"\u220F",
		sum:"\u2211",minus:"\u2212",lowast:"\u2217",radic:"\u221A",
		prop:"\u221D",infin:"\u221E",ang:"\u2220",and:"\u2227",or:"\u2228",
		cap:"\u2229",cup:"\u222A","int":"\u222B",there4:"\u2234",sim:"\u223C",
		cong:"\u2245",asymp:"\u2248",ne:"\u2260",equiv:"\u2261",le:"\u2264",
		ge:"\u2265",sub:"\u2282",sup:"\u2283",nsub:"\u2284",sube:"\u2286",
		supe:"\u2287",oplus:"\u2295",otimes:"\u2297",perp:"\u22A5",
		sdot:"\u22C5",vellip:"\u22EE",lceil:"\u2308",rceil:"\u2309",
		lfloor:"\u230A",rfloor:"\u230B",lang:"\u2329",rang:"\u232A",
		loz:"\u25CA",spades:"\u2660",clubs:"\u2663",hearts:"\u2665",
		"\u05E8\u05DC\u05DE":"\u200F","\u0631\u0644\u0645":"\u200F",
	};
	
	function Bold(content){
		this.content=content;
	}
	Bold.prototype={
		constructor:Bold,
		visit:function(visitor,data){
			return visitor.visit_bold(this,data);
		},
		toString:function(){
			return "'''"+this.content+"'''";
		}
	};
	
	function Italic(content){
		this.content=content;
	}
	Italic.prototype={
		constructor:Italic,
		visit:function(visitor,data){
			return visitor.visit_italic(this,data);
		},
		toString:function(){
			return "''"+this.content+"''";
		}
	};
	
	function XMLTag(name,attrs,content){
		this.name=name;
		this.content=typeof content=="undefined"?new Text([]):content;
		this.attrs=attrs||{};
	}
	XMLTag.prototype={
		constructor:XMLTag,
		visit:function(visitor,data){
			return visitor.visit_xml(this,data);
		},
		toString:function(){
			var attrs=this.attrs,content=this.content,s="<"+this.name;
			for(var name in attrs){
				var attr=attrs[name];
				s+=" "+name;
				if(Array.isArray(attr)){
					s+='="'+attr.join("");
				}
				else if(attr!==null){
					s+='="'+attr+'"';
				}
			}
			
			//Self-closing
			if(content===null){
				return s+"/>";
			}
			
			//Improper self-closing form
			if(content===false){
				return s+">";
			}
			
			return s+">"+this.content.join("")+"</"+this.name+">";
		}
	};
	
	function XMLComment(text){
		this.text=text;
	}
	XMLComment.prototype={
		constructor:XMLComment,
		visit:function(visitor,data){
			return visitor.visit_comment(this,data);
		},
		toString:function(){
			return "<!--"+this.text+"-->";
		}
	};
	
	function XMLEntity(text){
		this.text=text;
	}
	XMLEntity.prototype={
		constructor:XMLEntity,
		visit:function(visitor,data){
			return visitor.visit_entity(this,data);
		},
		toString:function(){
			return "&"+this.text+";";
		}
	};
	
	function Section(level,text){
		this.level=level;
		this.text=text;
		this.content=[];
		this.subsections=[];
	}
	Section.prototype={
		constructor:Section,
		visit:function(visitor,data){
			return visitor.visit_section(this,data);
		},
		toString:function(){
			var eq="======".slice(0,this.level);
			return eq+this.text+eq;
		}
	};
	
	function Article(title,content){
		Section.call(this,0,title);
	}
	var p=Article.prototype=Object.create(Section.prototype);
	p.constructor=Article;
	
	p.visit=function visit(visitor,data){
		return visitor.visit_article(this,data);
	}
	
	p.toString=function toString(){
		return this.content.join("");
	}
	
	function Template(secs){
		this.sections=secs;
	}
	Template.prototype={
		constructor:Template,
		visit:function(visitor,data){
			return visitor.visit_template(this,data);
		},
		toString:function(){
			return "{{"+this.sections.join("|")+"}}";
		}
	};
	
	function Paragraph(content){
		this.content=content;
	}
	Paragraph.prototype={
		constructor:Paragraph,
		visit:function(visitor,data){
			return visitor.visit_paragraph(this,data);
		},
		toString:function(){
			return this.content.join("");
		}
	};
	
	function Break(size){
		this.size=size;
	}
	Break.prototype={
		constructor:Break,
		visit:function(visitor,data){
			return visitor.visit_break(this,data);
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
			}
	};
	
	function Plaintext(text){
		this.text=text;
	}
	Plaintext.prototype={
		constructor:Plaintext,
		visit:function(visitor,data){
			return visitor.visit_plain(this,data);
		},
		toString:function(){
			return this.text;
		}
	};
	
	function Text(content){
		this.content=content;
	}
	Text.prototype={
		constructor:Text,
		visit:function(visitor,data){
			return visitor.visit_text(this,data);
		},
		toString:function(){
			return this.content.join("");
		}
	};
	
	function List(type,items){
		this.type=type;
		this.items=items;
	}
	List.prototype={
		constructor:List,
		visit:function(visitor,data){
			return visitor.visit_list(this,data);
		},
		toString:function(){
			var type=this.type;
			return this.items.map(function(v){
				return v.replace(/^/,type);
			}).join("\n");
		}
	};
	
	function maybe(text,r,ps){
		r.lastIndex=ps.pos;
		var m=r.exec(text);
		if(m && m.index==ps.pos){
			ps.pos+=m[0].length;
			return m;
		}
		return null;
	}
	
	var PLAINTEXT=/([^<'&]*)/g,
		SPACE=/\s+/gm;
	
	function parse_sq(text,ps,context){
		if(text.indexOf("'''",ps.pos)==ps.pos){
			var sq="'''",qt=Bold;
		}
		else if(text.indexOf("''",ps.pos)==ps.pos){
			var sq="''",qt=Italic;
		}
		else{
			return null;
		}
		
		ps.pos+=sq.length;
		
		var content=[];
		do{
			var m=maybe(text,PLAINTEXT,ps),cont=false;
			if(m[0]){
				content.push(m[0]);
				cont=true;
			}
			
			if(text.indexOf(sq,ps.pos)==ps.pos){
				break;
			}
			else if(typeof m[1]!="string"){
				var t=parse_list(text,ps,context);
				if(t){
					content.push(t);
					cont=true;
				}
				
				t=parse_break(text,ps,context);
				if(t){
					content.push(t);
					cont=true;
				}
			}
			else{
				var wt=parse_wikitext(text,ps,context);
				if(wt){
					content.push(wt);
					cont=true;
				}
			}
		}while(cont);
		
		ps.pos+=sq.length;
		
		//Either Bold or Italic
		return new qt(content);
	}
	
	var XML_START=/<\s*([^!\s="'`<\/>]+)/g,
		NON_XML_ENTITY=/[^&]*/g,
		XML_ENTITY=/&([^<>;]*);/g,
		XML_COMMENT=/<!--(.*?)-->/gm,
		XML_ATTR=/\s*([^!\s="'`</>]+)(?:\s*=\s*(?:"([^"\\]*)"|'([^'\\]*)'|`([^`\\]*)`|([^!\s="'`</>]+)))?/g,
		XML_END=/<\/\s*([^\s="'`<\/>]+)\s*>/g,
		NOWIKI=/[^<]*/gm,
		NOWIKI_END=/<\/\s*nowiki\s*>/gm;
	function parse_xml(text,ps,context){
		var save=ps.pos,m=maybe(text,XML_START,ps);
		if(m){
			var name=m[1],attrs={},tl=text.length,n;
			while(m=maybe(text,XML_ATTR,ps)){
				console.log("XML attr",m);
				var at=
					typeof m[2]=="string" && m[2] ||
					typeof m[3]=="string" && m[3] ||
					typeof m[4]=="string" && m[4] ||
					typeof m[5]=="string" && m[5] ||
					null;
				
				if(at===null){
					attrs[m[1]]=null;
					continue;
				}
				var attr=[],tps={pos:0},atn=m[1];
				
				for(;;){
					m=maybe(at,NON_XML_ENTITY,tps);
					if(m[0]){
						attr.push(m[0]);
					}
					else{
						break;
					}
					
					if(m=maybe(at,XML_ENTITY,tps)){
						attr.push(new WikiEntity(m[1]));
					}
				}
				
				attrs[atn]=attr;
			}
			
			maybe(text,SPACE,ps);
			
			//Self-closing
			if(text.indexOf("/>",ps.pos)==ps.pos){
				ps.pos+=2;
				return new XMLTag(name,attrs,null);
			}
			
			//Not a tag
			if(ps.pos>=tl || ps.pos<tl && text[ps.pos]!=">"){
				ps.pos=save;
				return null;
			}
			
			++ps.pos;
			
			if(context.xml_closed(name,attrs)){
				return new XMLTag(name,attrs,false);
			}
			
			if(name=="nowiki"){
				var content="";
				do{
					content+=maybe(text,NOWIKI,ps)[0];
				}while(!maybe(text,NOWIKI_END,ps));
				
				return new XMLTag("nowiki",attrs,[content]);
			}
			
			var content=[];
			do{
				var m=maybe(text,PLAINTEXT,ps),cont=false;
				console.log("XML content",m);
				if(m[0]){
					content.push(m[0]);
					cont=true;
				}
				
				if(n=maybe(text,XML_END,ps)){
					if(n[1]==name){
						break;
					}
					
					if(typeof content[content.length-1]=="string"){
						content[content.length-1]+=n[0];
					}
					else{
						content.push(n[0]);
					}
				}
				else if(typeof m[1]=="string"){
					var t=parse_list(text,ps,context);
					if(t){
						content.push(t);
						cont=true;
					}
					
					t=parse_break(text,ps,context);
					if(t){
						content.push(t);
						cont=true;
					}
				}
				else{
					var wt=parse_wikitext(text,ps,context);
					if(wt){
						content.push(wt);
						cont=true;
					}
				}
			}while(cont);
			
			return new XMLTag(name,attrs,content);
		}
		else if(m=maybe(text,XML_COMMENT,ps)){
			return new XMLComment(m[1]);
		}
		
		return null;
	}
	
	function parse_wikitext(text,ps,context){
		var t=parse_xml(text,ps,context);
		if(t){
			return t;
		}
		
		t=parse_sq(text,ps,context);
		if(t){
			return t;
		}
		
		t=maybe(text,XML_ENTITY,ps);
		if(t){
			return new XMLEntity(t[1]);
		}
		
		return null;
	}
	
	var HEADER=/^(={1,6})(.+?)(={1,6})$/gm;
	function parse_header(text,ps,context){
		var m=maybe(text,HEADER,ps);
		if(m){
			if(/^={2,}$/.test(m[0])){
				//L>>1 = Math.floor(L/2)
				var L=m[0].length,level=(L>>1)-(L%2);
			}
			else{
				var level=Math.min(m[1].length,m[3].length);
			}
			
			var h=new Section(level,m[0].slice(level,-level)),
				secs=context.sections,sl=secs.length;
			while(secs[--sl].level>=level){
				secs.pop();
			}
			secs.push(h);
			secs[sl].subsections.push(h);
			return h;
		}
		
		return null;
	}
	
	var LIST_START=/[*#;:]+/g,
		LIST_LINE=/[^<'&\n]*/g,
		NEWLINE=/\r\n?|[\n\x85\v\f\u2028\u2029]/gm;
	function parse_list(text,ps,context){
		var m=maybe(text,LIST_START,ps);
		//Make sure it's a list before creating objects
		if(m){
			var types=[],list=[],lpath=[],tl=text.length;
			do{
				var t=m[0],L=Math.min(t.length,types.length);
				//How many list characters are the same?
				for(var x=0;x<L && t[x]==types[x];++x){}
				//x==0 => different list
				if(x==0){
					ps.pos-=t.length;
					break;
				}
				console.log(x,t,lpath,text.slice(ps.pos));
				if(x<lpath.length){
					do{
						var lt=list;
						list=lpath.pop();
						list.push(new List(t[t.length-1],lt));
					}while(x<lpath.length);
				}
				else{
					while(x>lpath.length){
						lpath.push(list);
						list=[];
					}
				}
				types=t;
				
				var line=[];
				for(;;){
					m=maybe(text,LIST_LINE,ps);
					if(ps.pos>=tl || maybe(text,NEWLINE,ps)){
						line.push(m[0]);
						break;
					}
					else{
						var wt=parse_wikitext(text,ps,context);
						if(wt){
							line.push(m[0],wt);
						}
						else if(ps.pos<tl){
							line.push(m[0]+text[ps.pos++]);
						}
					}
				}
				list.push(line);
			}while(m=maybe(text,LIST_START,ps));
			
			while(lpath.length){
				var lt=list;
				list=lpath.pop();
				list.push(new List(types[types.length-1],lt));
			}
			
			return list[0];
		}
		
		return null;
	}
	
	var BREAK=/^-{4,}/g;
	function parse_break(text,ps,context){
		var m=maybe(text,BREAK,ps);
		if(m){
			return new Break(m[0].length);
		}
		return null;
	}
	
	function parse_text(text,context){
		var tl=text.length,content=[],ps={pos:0};
		
		do{
			//Plaintext (doesn't account for start of line parsing)
			var m=maybe(text,PLAINTEXT,ps),cont=false;
			if(m[0]){
				var last=content.length-1;
				if(typeof content[last]=="string"){
					content[last]+=m[0];
				}
				else{
					content.push(m[0]);
				}
				cont=true;
			}
			
			//General wikitext
			var wt=parse_wikitext(text,ps,context);
			if(wt){
				content.push(wt);
				cont=true;
			}
			else if(!cont){
				if(ps.pos<tl){
					var last=content.length-1;
					if(typeof content[last]=="string"){
						content[last]+=text[ps.pos++];
					}
					else{
						content.push(text[ps.pos++]);
					}
					cont=true;
				}
			}
		}while(cont);
		
		return content;
	}
	
	function parse(text,context){
		context=context||{};
		context.entities=context.entities||HTML_ENTITIES;
		context.template=context.template||function(secs){
			return new Template(secs,false);
		}
		context.sections=context.sections||
			[new Article(context.title||"")];
		context.xml_closed=function(){
			return false;
		}
		
		var ps={pos:0},tl=text.length,
			article=context.sections[0],ac=article.content;
		
		while(ps.pos<tl){
			//Start of line stuff
			var t=parse_header(text,ps,context);
			if(t){
				//parse_header results add themselves to the context
				continue;
			}
			
			t=parse_list(text,ps,context);
			if(t){
				ac.push(t);
				continue;
			}
			
			t=parse_break(text,ps,context);
			if(t){
				ac.push(t);
				continue;
			}
		}
		
		return article;
	}
	
	var TPARAM_OPEN=/\{\{\{([^{}]*)/gm,
		T_OPEN=/\{\{([^{}]*)/gm,
		T_TEXT=/([^{}]*)/gm;
	function parse_template(text,ps,context){
		var save=ps.pos,m=maybe(text,TPARAM_OPEN,ps),tl=text.length;
		if(m){
			var param="";
			do{
				param+=m[1];
				switch(text[ps.pos]){
					case "{":
						var t=parse_template(text,ps,context);
						if(t){
							param+=t;
						}
						else{
							param+="{";
							++ps.pos;
						}
						continue;
					
					case "}":
						++ps.pos;
						if(text.indexOf("}}",ps.pos)==ps.pos){
							ps.pos+=2;
							return context.template_param(param,context);
						}
						param+="}";
						continue;
				}
				
				break;
			}while(m=maybe(text,T_TEXT,ps));
			
			ps.pos=save;
			return null;
		}
		
		if(m=maybe(text,T_OPEN,ps)){
			var content=m[1];
			do{
				switch(text[ps.pos]){
					case "{":
						var t=parse_template(text,ps,context);
						if(t){
							content+=t;
						}
						else{
							content+="{";
							++ps.pos;
						}
						continue;
					
					case "}":
						++ps.pos;
						if(ps.pos<tl && text[ps.pos]=="}"){
							++ps.pos;
							console.log(content);
							return context.template(content.split("|"));
						}
						content+="}";
						continue;
				}
				
				break;
			}while(m=maybe(text,T_TEXT,ps));
		}
		
		//m==null => EOF, wasn't a template
		ps.pos=save;
		return null;
	}
	
	var NON_TEMPLATE=/[^{]*/g;
	function preprocess(text,context){
		context=context||{};
		context.entities=context.entities||HTML_ENTITIES;
		context.template=context.template||function(secs,context){
			return new Template(secs);
		}
		context.template_param=context.template_param||function(param,context){
			var x=param.indexOf("|");
			if(x<0){
				return "{{{"+param+"}}}";
			}
			return param.slice(x+1);
		}
		
		var m,ps={pos:0},res="";
		//Process text in chunks between templates
		while(m=maybe(text,NON_TEMPLATE,ps)){
			//Get rid of control characters (covers templates)
			res+=m[0];
			var t=parse_template(text,ps,context);
			if(t){
				res+=t;
			}
			else{
				++ps.pos;
			}
		}
		return res;
	}
	
	function normalize(text){
		return text.replace(/\r\n|[\r\x85\v\f\u2028\u2029]/gm,"\n").
			replace(/[\x00-\x09\x0b-\x1f\x7f-\x9f]/gm,"");
	}
	
	function lcs(a,sa,ea,b,sb,eb){
		var x=0,t;
		//Fast walk through beginning
		while(x<sa && x<sb && (t=a[x])==b[x]){
			if(t>=0xd800 && t<=0xdbff){
				++sa;
				++sb;
			}
			++sa;
			++sb;
		}
		
		//Fast walk through end
		while(x<ea && x<eb && (t=a[ea-1])==b[eb-1]){
			--ea;
			--eb;
			if(t>=0xd800 && t<=0xdbff){
				--ea;
				--eb;
			}
		}
		
		if(sa==ea){
			
		}
		else if(sb==eb){
			
		}
		else{
			
		}
	}
	
	/*
	return {
		normalize:normalize,
		preprocess:preprocess,
		parse:parse,
		process:function(text,context){
			return parse(preprocess(normalize(text),context),context);
		},
		XMLTag:XMLTag,
		Section:Section,
		//Utility function for MediaWiki-like template processing
		process_template:function(secs,build){
			var pos=[],named={},sl=secs.length;
			for(var i=0;i<sl;++i){
				var e=secs[i].split(/=(.*)/,2);
				if(e.length>1){
					named[e[0].trim()]=e[1].trim();
				}
				else{
					pos.push(e[0]);
				}
			}
			
			if(typeof build=="function"){
				return build(pos,named);
			}
			return new Template(pos,named,false);
		}
	};
})();
//*/