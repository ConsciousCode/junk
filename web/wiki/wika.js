function Text(value) {
	this.value = value;
}

function Section(level, content, title) {
	this.level = level;
	this.content = content;
	this.subsections = [];
	this.title = title;
}

function Template(params) {
	this.params = params;
}

function maybe(r, t, p) {
	r.lastIndex = p.pos;
	
	var m = r.exec(t);
	if(m && m.index == p.pos) {
		p.pos = r.lastIndex;
		return m;
	}
	
	return null;
}

/**
 * Process just the templates of the given wikatext, performing substitutions
 *  as necessary. tpl and param are functions which take a list of |-separated
 *  parameters.
**/
function process_tpl(text, tpl, param) {
	var
		OPEN_VAR = /\{\{\{/gm, CLOSE_VAR = /\}\}\}/gm,
		OPEN_TPL = /\{\{/gm, CLOSE_TPL = /\}\}/gm,
		TEXT = /[^<{}]+/gm,
		OPEN_NOWIKI = /<\s*nowiki\s*>/gmi,
		CLOSE_NOWIKI = /<\/\s*nowiki\s*>/gmi;
	
	function bake(p) {
		if(p == "") {
			return [];
		}
		
		return p.split("|");
	}
	
	var p = {pos: 0}, v = [], out = "", m;
	while(p.pos < text.length) {
		if(m = maybe(OPEN_VAR, text, p)) {
			v.push({tpl: false, text: ""});
		}
		else if(m = maybe(CLOSE_VAR, text, p)) {
			if(v.length) {
				var d = v.pop(), t = bake(d.text);
				
				if(d.tpl) {
					//If this matches a template, we've parsed too much
					--p.pos;
					
					t = tpl(t);
					
					if(v.length) {
						v[v.length - 1].text += t;
					}
					else {
						out += t;
					}
				}
				else {
					t = param(t);
					
					if(v.length) {
						v[v.length - 1].text += t;
					}
					else {
						out += t;
					}
				}
			}
			else {
				out += "}}}";
			}
		}
		else if(m = maybe(OPEN_TPL, text, p)) {
			v.push({tpl: true, text: ""});
		}
		else if(m = maybe(CLOSE_TPL, text, p)) {
			if(v.length) {
				var d = v.pop(), t;
				if(d.tpl) {
					t = tpl(bake(d.text));
				}
				else {
					//If this matches a param, we didn't parse enough
					t = "}}";
				}
				
				if(v.length) {
					v[v.length - 1].text += t;
				}
				else {
					out += t;
				}
			}
			else {
				out += "}}";
			}
		}
		else if(m = maybe(OPEN_NOWIKI, text, p)) {
			CLOSE_NOWIKI.lastIndex = p.pos;
			
			var n = CLOSE_NOWIKI.exec(text);
			if(n) {
				var t =
					m[0] +
					text.substring(OPEN_NOWIKI.lastIndex, n.index) +
					n[0];
				
				if(v.length) {
					v[v.length - 1].text += t;
				}
				else {
					out += t;
				}
			}
			else {
				var t = m[0] + text.substring(OPEN_NOWIKI.lastIndex);
				if(v.length) {
					v[v.length - 1].text += t;
				}
				else {
					out += t;
				}
				
				break;
			}
		}
		else if(m = maybe(TEXT, text, p)) {
			if(v.length) {
				v[v.length - 1].text += m[0];
			}
			else {
				out += m[0];
			}
		}
		else {
			var t = text[p.pos++];
			
			if(v.length) {
				v[v.length - 1] += t;
			}
			else {
				out += t;
			}
		}
	}
	
	for(var i = 0; i < v.length; ++i) {
		out += (v[i].tpl?"{{":"{{{") + v[i].text
	}
	
	return out;
}

function metaparse(data, parsers, end) {
	var todo = [], x = data.pos;
	
	for(var i = 0; i < parsers.length; ++i) {
		var p = parsers[i].find(data);
		if(p != -1) {
			todo.push({x: i, p: p});
		}
	}
	
	todo.sort(function(a, b) {
		return a.p - b.p;
	}).filter(function(v) {
		return a.x < end;
	});
	
	for(var i = 0; i < todo.length; ++i) {
		var t = todo[i];
		
		data.pos = t.p;
		if(sol[t.x].parse(data)) {
			return true;
		}
	}
	
	return false;
}

function ParseData(text) {
	this.text = text;
	this.pos = 0;
	this.secs = [new Section(0, [], null)];
	this.progress = [];
	this.data = {};
}
ParseData.prototype.add_upto = function(pos) {
	this.add_embedded(new Text(this.text.substring(this.pos, pos)));
	
	this.pos = pos;
}
ParseData.prototype.add_section = function(sec) {
	while(this.secs[this.secs.length - 1].level >= sec.level) {
		this.secs.pop();
	}
	
	this.secs[this.secs.length - 1].subsections.push(sec);
}
ParseData.prototype.add_paragaph = function(p) {
	this.secs[this.secs.length - 1].content.push(p);
}
ParseData.prototype.add_embedded = function(e) {
	var s = this.secs[this.secs.length - 1];
	s.content[s.content.length - 1].content.push(e);
}

var NEWLINE = /\r?\n/g;
function parse(text, sol, emb) {
	var data = new ParseData(text);
	
	for(var i = 0; i < sol.length; ++i) {
		sol[i].init(data);
	}
	
	for(var i = 0; i < sol.length; ++i) {
		emb[i].init(data);
	}
	
	while(p.pos < text.length) {
		if(metaparse(data, sol, Infinity)) {
			continue;
		}
		
		NEWLINE.lastIndex = p.pos;
		NEWLINE.exec(text);
		
		while(metaparse(p, emb, NEWLINE.lastIndex)) {
			NEWLINE.lastIndex = p.pos;
			NEWLINE.exec(text);
		}
	}
	
	return data.secs[0];
}

function find(re, data) {
	re.lastIndex = data.pos;
	return data.text.indexOf(re);
}

var nowiki = {
	pattern: /<\s*nonwiki\s*>(.+?)<\/\s*nowiki\s*>/gmi,
	init: function() {},
	find: function(data) {
		return find(this.pattern, data);
	},
	parse: function(data) {
		return maybe(this.pattern, data.text, data);
	}
};

var quote = {
	pattern: /'''?/,
	init: function(data) {
		data.data.quote = [];
	},
	find: function(data) {
		return find(this.pattern, data);
	},
	parse: function(data) {
		var m = maybe(this.pattern, data.text, data);
		if(data.data.quote[0] == m[0].length) {
			while(data.progress[data.progress.length - 1] != m[0]) {
				data.progress.pop();
			for(var i = data.progress.length - 1; i >= 0; --i) {
				
			}
		}
	}
};

