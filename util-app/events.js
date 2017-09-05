'use strict';

const
	subproc = require('child_process');

const
	newinp = document.querySelector('#newcmd input'),
	newbut = document.querySelector('#newcmd button'),
	entries = document.querySelector('#entries');

function E(tag, attrs, children) {
console.log(attrs, children);
	if(Array.isArray(attrs)) {
		children = attrs;
		attrs = {};
	}
	else if(typeof attrs === 'string') {
		children = [attrs];
		attrs = {};
	}
	else if(typeof children !== 'undefined' && !Array.isArray(children)) {
		children = [children];
	}
	else {
		attrs = attrs||{};
	}
	
	console.log(attrs, children);
	
	let e = document.createElement(tag);
	for(let a in attrs) {
		e.setAttribute(a, attrs[a]);
	}
	for(let c of children||[]) {
		if(typeof c === "string") {
			c = document.createTextNode(c);
		}
		e.appendChild(c);
	}
	
	e.on = function(ev, fn) {
		this.addEventListener(ev, fn);
		return this;
	}
	
	return e;
}

function add_entry(what) {
	entries.prepend(
		E('li', {class: 'entry group'}, [
			E('div', {class: 'entry'}, what).on(
				'click', function() {
					subproc.exec(
						this.parentNode.children[0].value
					);
				}
			),
			E('button', '='),
			E('button', 'x️').on('click', function() {
				this.parentNode.remove();
			})
		])
	);
}

newbut.addEventListener('click', () => {
	console.log("Hello");
	add_entry(newinp.value);
	newinp.value = "";
});
