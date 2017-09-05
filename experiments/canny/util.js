'use strict';

/**
 * Simplifies element creation.
 *
 * E(tag name, [attrs], [children])
**/
function E(tag, attrs, children) {
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

/**
 * Pretty version of E for making div elements, since they're
 *  so absurdly common.
**/
function div(id, klass, attrs, children) {
	// id and klass are optional
	if(typeof id !== 'string') {
		attrs = id;
		children = klass;
		id = null;
		klass = null;
	}
	else if(typeof klass !== 'string') {
		children = attrs;
		attrs = klass;
		klass = null;
	}
	
	attrs = attrs||{};
	if(id) {
		attrs.id = id;
	}
	if(klass) {
		attrs.class = klass;
	}
	
	return E('div', attrs, children);
}

/**
 * Run code when the document is loaded. If it's already
 *  loaded, run the code immediately.
**/
let ready = (function() {
	let todo = [], isReady = false;
	
	document.addEventListener(
		"DOMContentLoaded",
		function() {
			if(!isReady) {
				for(let fn of todo) {
					fn.call(window, []);
				}
				todo = null;
				isReady = true;
			}
		}, false
	);
	
	return function(fn) {
		if(isReady) {
			fn();
		}
		else {
			todo.push(fn);
		}
	}
})();

/**
 * Shorter version of getElementById
**/
function byId(id) {
	return document.getElementById(id);
}

/**
 * Simplifies a common boiler plate pattern of grabbing
 *  elements by their ids to hook event handlers and
 *  provide references for those handlers, because
 *  separation of content and beahviors requires it.
 *
 * This returns an id:element mapping.
**/
function prescript(ids) {
	let doc = {};
	for(let id in ids) {
		let events = ids[id], el = byId(id);
		if(!el) {
			throw new Error(`No such element #${id}`);
		}
		for(let ev in events) {
			el.addEventListener(ev, events[ev]);
		}
		doc[id] = el;
	}
	
	return doc;
}
