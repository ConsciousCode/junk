/**
 * Utility function for converting an object to an XML-like attribute list.
**/
function obj2attr(obj){
	if(!obj){
		return "";
	}
	
	const keys=Object.keys(obj),out=[];
	
	for(let i=keys.length;i--;){
		const key=keys[i];
		out.push(key+'="'+obj[key]+'"');
	}
	
	return out.join(" ");
}

/**
 * Base class for all Wika AST nodes.
**/
export class Node{}

/**
 * Encodes an article or sub-article (i.e. section).
**/
export class Article extends Node{
	constructor(title="",subsections=[]){
		super();
		
		this.title=title;
		this.subsections=subsections;
	}
	
	toString(){
		const ss=this.subsections,sl=ss.length;
		
		if(sl && ss[0].level==1){
			return ss[0].paragraphs.join("")+"\n"+ss.slice(1).join("");
		}
		return ss.join();
	}
	
	visit(v){
		return v.visit("article",this);
	}
}

/**
 * Encodes a section of an article, delineated by the header syntax.
**/
export class Section extends Article{
	constructor(level,title=[],paragraphs=[],subsections=[]){
		super(title);
		
		this.level=level;
		this.title=title;
		this.paragraphs=paragraphs;
		this.subsections=subsections;
	}
	
	toString(){
		const h='='.repeat(this.level);
		return h+this.title.join("")+h+"\n"+this.paragraphs.join("\n\n")+
			"\n"+this.subsections.join("");
	}
	
	visit(v){
		return v.visit("section",this);
	}
}

/**
 * A node which encodes unformatted text, used to keep the AST interface
 *  consistent.
**/
export class Text extends Node{
	constructor(value){
		super();
		
		this.value=value;
	}
	
	toString(){
		return this.value;
	}
	
	visit(v){
		return v.visit("text",this);
	}
}

/**
 * A paragraph in the article.
**/
export class Paragraph extends Node{
	constructor(content=[]){
		super();
		this.content=content;
	}
	
	toString(){
		return this.content.join("");
	}
	
	visit(v){
		return v.visit("paragraph",this);
	}
}

/**
 * A double-quoted italic node.
**/
export class Italic extends Node{
	constructor(content=[]){
		super();
		this.content=content;
	}
	
	toString(){
		return "''"+this.content.join("")+"''";
	}
	
	visit(v){
		return v.visit("italic",this);
	}
}

/**
 * A triple-quoted bold node.
**/
export class Bold extends Node{
	constructor(content=[]){
		super();
		this.content=content;
	}
	
	toString(){
		return "'''"+this.content.join("")+"'''";
	}
	
	visit(v){
		return v.visit("bold",this);
	}
}

/**
 * A list.
**/
export class List extends Node{
	constructor(type,items=[]){
		super();
		this.type=type;
		this.items=items;
	}
	
	toString(){
		function flatten(list){
			const type=list.type,out=[];
			
			for(const item of list.items){
				if(Array.isArray(item)){
					out.push(type+item.join(""));
				}
				else{
					for(const subitem of flatten(item)){
						out.push(type+subitem);
					}
				}
			}
			
			return out;
		}
		
		return flatten(this).join("\n");
	}
	
	visit(v){
		return v.visit("list",this);
	}
}

/**
 * Link to another page in the wiki.
**/
export class PageLink extends Node{
	constructor(params=[]){
		super();
		this.params=params;
	}
	
	toString(){
		return "[["+this.params.join("|")+"]]";
	}
	
	visit(v){
		return v.visit("pagelink",this);
	}
}

/**
 * Link to external pages.
**/
export class Link extends Node{
	constructor(url,text){
		super();
		this.url=url;
		this.text=text;
	}
	
	toString(){
		if(this.text){
			return "["+this.url+" "+this.text+"]";
		}
		
		return "["+this.url+"]";
	}
	
	visit(v){
		return v.visit("link",this);
	}
}

/**
 * Horizontal break.
**/
export class Break extends Node{
	constructor(size=4){
		super();
		this.size=size;
	}
	
	toString(){
		return '-'.repeat(this.size);
	}
	
	visit(v){
		return v.visit("break",this);
	}
}

/**
 * Preformatted block.
**/
export class Pre extends Node{
	constructor(content=[]){
		super();
		
		this.content=content;
	}
	
	toString(){
		return this.content.join("");
	}
	
	visit(v){
		return v.visit("pre",this);
	}
}

/**
 * A table cell
**/
export class Cell extends Node{
	constructor(header=false,attrs=null,content=[]){
		super();
		
		this.header=header;
		this.attrs=attrs;
		this.content=content;
	}
	
	toString(){
		const attr=obj2attr(this.attrs);
		
		if(this.header){
			return (attr?"!"+attr+"|":"!")+this.content.join("");
		}
		return (attr?"|"+attr+"|":"|")+this.content.join("");
	}
	
	visit(v){
		return v.visit("cell",this);
	}
}

/**
 * A table row
**/
export class Row extends Node{
	constructor(attrs=null,content=[]){
		super();
		
		this.attrs=attrs;
		this.content=content;
	}
	
	toString(){
		const attr=obj2attr(this.attrs);
		
		return (attr?"|- "+attr+"\n":"|-\n")+this.content.join("");
	}
	
	visit(v){
		return v.visit("row",this);
	}
}

/**
 * Node for wiki-style tables.
**/
export class Table extends Node{
	constructor(attrs=null,caption=null,content=[]){
		super();
		
		this.attrs=attrs;
		this.caption=caption
		this.content=content;
	}
	
	toString(){
		const attr=obj2attr(this.attrs),caption=this.caption;
		
		if(caption){
			return (attr?"{|"+attr+"\n":"{|\n")+"|"+caption+
				this.content.join("")+"|}";
		}
		return (attr?"{|"+attr+"\n":"{|\n")+this.content.join("")+"|}";
	}
	
	visit(v){
		return v.visit("table",this);
	}
}

/**
 * Node for unprocessed templates.
**/
export class Template extends Node{
	constructor(params=[]){
		super();
		
		this.params=params;
	}
	
	toString(){
		return this.params.join("|");
	}
	
	visit(v){
		return v.visit("template",this);
	}
}

/**
 * Node for unprocessed template parameters.
**/
export class TemplateParam extends Node{
	constructor(name,missing=null){
		super();
		
		this.name=name;
		this.missing=missing;
	}
	
	toString(){
		if(this.missing){
			return "{{{"+this.name+"|"+this.missing+"}}}";
		}
		
		return "{{{"+this.name+"}}}";
	}
	
	visit(v){
		return v.visit("templateparam",this);
	}
}

/**
 * Parent class for pseudo-XML nodes in Wika.
**/
export class XMLNode extends Node{}

/**
 * A node which encodes an XML entity. Entity identity must be preserved to
 *  maintain reversibility and maximize extensibility.
**/
export class XMLEntity extends XMLNode{
	constructor(name){
		super();
		
		this.name=name;
	}
	
	toString(){
		return "&"+this.name+";";
	}
	
	visit(v){
		return v.visit("entity",this);
	}
}

/**
 * An XML comment.
**/
export class XMLComment extends XMLNode{
	constructor(content){
		super();
		
		this.content=content;
	}
	
	toString(){
		return "<!--"+this.content+"-->";
	}
	
	visit(v){
		return v.visit("comment",this);
	}
}

/**
 * An XML tag.
**/
export class XMLTag extends XMLNode{
	constructor(name,attrs={},content=null){
		super();
		
		this.name=name;
		this.attrs=attrs;
		this.content=content;
	}
	
	toString(){
		const name=this.name,content=this.content;
		
		let attrs=obj2attr(this.attrs);
		if(attrs){
			attrs=" "+attrs;
		}
		
		if(content===null){
			return "<"+name+attrs+"/>";
		}
		if(content){
			return "<"+name+attrs+">"+content.join("")+"</"+name+">";
		}
		
		return "<"+name+attrs+">";
	}
	
	visit(v){
		return v.visit("xmltag",this);
	}
}

/**
 * A section of wika which contains only plaintext and XML entities, such
 *  as XML tag attribute values.
**/
export class EntityText extends XMLNode{
	constructor(content=[]){
		super();
		
		this.content=content;
	}
	
	toString(){
		return this.content.join("");
	}
	
	visit(v){
		return v.visit("entitytext",this);
	}
}

/**
 * Main parser for Wika.
 * 
 * Note: Might want to rearrange parser plugins to have two functions, one
 *  for getting the index of a wika object and another for actually parsing
 *  it. This enables the implicit definition of plaintext via whatever isn't
 *  explicitly parsed by something else
**/
export class Parser{
	constructor(sp=[],rp=[]){
		this.pos=0;
		this.cur=null;
		this.path=null;
		
		this.start_parsers=sp||Parser.start_parsers;
		this.rest_parsers=rp||Parser.rest_parsers;
	}
	
	/**
	 * Parse the given text with the given context.
	 * 
	 * Parsing works via loaded subparsers each responsible for their own
	 *  mutually exclusive syntax. Parsers come in two flavors:
	 * 
	 * Start parsers use syntax which can only occur at the start of a
	 *  line, such as section headers and lists. These are expected to
	 *  consume the entire line and must provide a parse method which
	 *  returns the parsed element or null if either there is none or what
	 *  was parsed shouldn't be added to the current section.
	 * 
	 * Rest parsers use syntax which can occur at any point in a wika
	 *  article. They provide two methods: index, which returns a low-cost
	 *  speculation of the index of the next parseable element, and parse,
	 *  which returns the parsed element or null if there is none.
	 * 
	 * Plaintext is implicitly defined by what isn't parsed by the
	 *  subparsers.
	**/
	parse(text,context){
		const title=context.title||"",s1=new Section(1,[new Text(title)]),
			article=new Article(title,[s1]),tl=text.length;
		
		context=context||{};
		context.self_close=context.self_close||(()=>false);
		
		this.pos=0;
		this.cur=article.subsections[0];
		this.path=[];
		
		while(this.pos<tl){
			let x;
			while(
				!(x=this.parse_start(text,context)) ||
				this.parse_header(text)
			){
				this.cur.paragraphs.push(x);
			}
			
			x=this.parse_rest(text,context);
			if(x){
				this.cur.paragraphs.push(new Paragraph(x));
			}
		}
		
		return article;
	}
	
	/**
	 * Query all the loaded parsers for the indices of their next parseable
	 *  elements and order them by those indices, cutting off at the index
	 *  of the end of the line. Parsers which use this are to iterate over
	 *  the returned array until one returns non-null, at which point the
	 *  text between the current position and the index of that parser
	 *  element is to be added to the output followed by the element.
	**/
	get_parsers(text,context){
		const EOL=/$/gm;
		EOL.lastIndex=this.pos;
		EOL.test(text);
		const next=[],eol=EOL.lastIndex;
		for(const parser of this.rest_parsers){
			const index=parser.index(text,this);
			if(index<eol){
				next.push({index,parser});
			}
		}
		
		next.sort((a,b)=>a.index-b.index);
		
		return next;
	}
	
	/**
	 * Attempt to parse a header, which starts a new section. Return true
	 *  on success, else false.
	 * 
	 * This is a separate method from the start_parsers modules because
	 *  it's deeply involved in the structure of the AST and would require
	 *  special handling otherwise.
	**/
	parse_header(text){
		const head=/^(={1,6})(.+?)(={1,6})$/gm,pos=this.pos;
		head.lastIndex=pos;
		const m=head.exec(text);
		
		if(m && m.index==pos){
			this.pos=m.lastIndex;
			
			const left=m[1],right=m[3];
			let section,level,content=m[2];
			
			if(content){
				if(left.length==right.length){
					level=left.length;
				}
				else if(left.length<right.length){
					level=left.length;
					content+='='.repeat(right.length-level);
				}
				else{
					level=right.length;
					content='='.repeat(left.length-level)+content;
				}
				
				section=new Section(left.length,content);
			}
			else{
				const hl=m[0].length;
				level=hl>>1;
				section=new Section(level,hl%2?'=':'==');
			}
			
			const path=this.path;
			
			while(
				path.length>0 && path[path.length-1].level>=level
			){
				path.pop();
			}
			path.push(section);
			this.cur=section;
			
			return true;
		}
		
		return false;
	}
	
	/**
	 * Attempt to use parsers which must be at the start of a line. Return
	 *  the parsed element, else null.
	**/
	parse_start(text,context){
		for(const parser of this.start_parsers){
			const res=parser.call(this,text,context);
			if(res){
				return res;
			}
		}
		
		return null;
	}
	
	/**
	 * Attempt to use parsers which can exist at any point in the article.
	 *  Return an array of parsed elements, including the implicitly
	 *  defined plaintext, else null.
	**/
	parse_rest(text,context){
		const out=[],EOL=/$/gm;
		let eol,pos;
		
		do{
			const parsers=this.get_parsers(text,context);
			//Figure out where EOL is so we can make sure we haven't
			// consumed everything we can just yet
			EOL.lastIndex=pos=this.pos;
			EOL.test(text);
			eol=EOL.lastIndex;
			
			//Go over all the parsers...
			for(const {index,parse} of parsers){
				const res=parse.call(this,text,context);
				//... until one works, then repeat
				if(res){
					//Consume any plaintext
					if(pos!=index){
						out.push(new Text(text.slice(pos,index)));
					}
					out.push(res);
					break;
				}
			}
		//Keep going while we still have parsers
		}while(parsers.length);
		
		//We parsed something
		if(out.length){
			//Consume the rest of the line, if any
			const SOL=/^/gm;
			SOL.lastIndex=pos;
			SOL.test(text);
			//We want to go for ^ to grab the newlines, but at EOF that'll 
			// be 0 so we'll want $
			const x=Math.max(SOL.lastIndex,eol);
			
			if(pos!=x){
				out.push(new Text(text.slice(pos,x)));
				this.pos=x;
			}
			
			return out;
		}
		
		return null;
	}
	
	/**
	 * Builtin start-of-line parser modules.
	**/
	static start_parsers=[
		{
			parse:function parse_pre(text){
				const pre=[];
				while(/\s/.test(text[this.pos])){
					pre.push(this.parse_rest(text));
				}
				
				if(pre.length){
					return new Pre(pre);
				}
				return null;
			}
		},{
			parse:function hr(text){
				const HR=/^-{4,}$/gm;
				HR.lastIndex=this.pos;
				const m=HR.exec(text);
				
				if(m){
					return new Break(m[0].length);
				}
				return null;
			}
		}
	];
	
	/**
	 * Builtin general-purpose parsers.
	**/
	static rest_parsers=[
		{
			index:function(text){
				const re=/&[^;]+?;|<!--.+?-->|<[a-z_][-a-z_.:]*(?:\s*[a-z_][-a-z_.:]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|`[^`]`|[^\s<>"'`]+))?)*\s*\/?>/gm;
				re.lastIndex=this.pos;
				
				return re.test(text) && re.lastIndex;
			},
			parse:function(text,context){
				const re=/(&[^;]+?;)|(?:<!--(.+?)-->)|(?:<([a-z_][-a-z_.:]*)((?:\s*[a-z_][-a-z_.:]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|`[^`]`|[^\s<>"'`]+))?)*)\s*(\/)?>)/gm;
				re.lastIndex=this.pos;
				const m=re.exec(text);
				if(m){
					this.pos=re.lastIndex;
					
					if(m[1]){
						return new XMLEntity(m[1]);
					}
					
					if(m[2]){
						return new XMLComment(m[2]);
					}
					
					const name=m[3],
						ats=m[4],
						attrs={},
						qre=/(\S+)\s*=\s*(?:"([^"]*)"|'([^']*)'|`([^`])`|(\S+))/gm;
					let qm;
					
					while(qm=qre.exec(ats)){
						attrs[qm[1]]=qm[2]||qm[3]||qm[4]||qm[5];
					}
					
					if(m[5] || context.self_close(name)){
						return new XMLTag(name,attrs,null);
					}
				}
			}
		}
	];
}
