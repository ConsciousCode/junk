'use strict';

const
	x11 = require("x11"),
	events = require('events');

// Event mappings from https://code.woboq.org/gtk/include/X11/X.h.html
const EVENTS = {
	2: "KeyPress",
	3: "KeyRelease",
	4: "ButtonPress",
	5: "ButtonRelease",
	6: "MotionNotify",
	7: "EnterNotify",
	8: "LeaveNotify",
	9: "FocusIn",
	10: "FocusOut",
	11: "KeymapNotify",
	12: "Expose",
	13: "GraphicsExpose",
	14: "NoExpose",
	15: "VisibilityNotify",
	16: "CreateNotify",
	17: "DestroyNotify",
	18: "UnmapNotify",
	19: "MapNotify",
	20: "MapRequest",
	21: "ReparentNotify",
	22: "ConfigureNotify",
	23: "ConfigureRequest",
	24: "GravityNotify",
	25: "ResizeRequest",
	26: "CirculateNotify",
	27: "CirculateRequest",
	28: "PropertyNotify",
	29: "SelectionClear",
	30: "SelectionRequest",
	31: "SelectionNotify",
	32: "ColormapNotify",
	33: "ClientMessage",
	34: "MappingNotify",
	35: "GenericEvent",
	36: "<LAST>"
}
// Attribute mappings from the same place.
const ATTRMASK = {
	BackPixmap: (1L<<0),
	BackPixel: (1L<<1),
	BorderPixmap: (1L<<2),
	BorderPixel: (1L<<3),
	BitGravity: (1L<<4),
	WinGravity: (1L<<5),
	BackingStore: (1L<<6),
	BackingPlanes: (1L<<7),
	BackingPixel: (1L<<8),
	OverrideRedirect: (1L<<9),
	SaveUnder: (1L<<10),
	EventMask: (1L<<11),
	DontPropagate: (1L<<12),
	Colormap: (1L<<13),
	Cursor: (1L<<14)
};

const ATTRS = [
	"visual", "klass", "bitGravity", "winGravity",
	"backingPlanes", "backingPixel", "saveUnder",
	"mapIsInstalled", "mapState", "overrideRedirect",
	"colormap", "allEventMasks", "myEventMasks",
	"doNotPropogateMask"
];

const ATTR_PROXY = {
	get: function(target, key) {
		return target[ATTRS.indexOf(key)];
	},
	set: function(target, key, val) {
		target[ATTRS.indexOf(key)] = val;
	},
	has: function(target, key) {
		return ATTRS.indexOf(key) !== -1;
	},
	ownKeys: function(target) {
		return ATTRS.slice(0);
	}
};

class Future extends Promise {
	constructor(val) {
		super(val);
		
		this.value = null;
		this.is_resolved = false;
		this.is_rejected = false;
		this.waiting = [];
		
		super.then(val => {
			this.value = val;
			this.is_resolved = true;
			for(let w of this.waiting) {
				w.ok(val);
			}
		}).catch(err => {
			this.is_rejected = true;
			for(let w of this.waiting) {
				w.no(err);
			}
		});
	}
	
	getValue() {
		return new Promise((ok, no) => {
			if(this.is_resolved) {
				ok(this.value);
			}
			else if(this.is_rejected) {
				no(this.value);
			}
			else {
				this.waiting.push({ok, no});
			}
		});
	}
	
	then(f) {
		return this.getValue().then(f);
	}
	
	catch(f) {
		return this.getValue().catch(f);
	}
}

class XServer extends events.EventEmitter {
	constructor() {
		this.X = new Future();
		this.display = new Future();
		this.render = new Future();
		this.client = x11.createClient((err, display) => {
			if(err) {
				this.emit('error', err);
				return;
			}
			this.display.resolve(display);
			let X = this.X = display.client;
			X.require('render', (err, render) => {
				this.render = render;
				X.Render = Render;
				this.root = display.screen[0].root;
				this.white = display.screen[0].white_pixel;

				X.ChangeWindowAttributes(root, {
					eventMask: x11.eventMask.Exposure|
						x11.eventMask.SubstructureRedirect
				}, err => this.replace_wm());

				X.QueryTree(root, (err, tree) => {
					for(let child of tree.children) {
						this.manageWindow(child);
					}
				})
			})
		}).
			on('error', err => this.emit('error', err)).
			on('event', ev => {
				this.emit('event', EVENTS[ev.type]);
			});
	}
	
	getScreen(n) {
		return this.display.then(d => {
			return new Screen(d[n], this);
		});
	}
}

class Screen extends events.EventEmitter {
	
}

class Window extends events.EventEmitter {
	constructor(id, xserv) {
		this.id = id;
		this.xserv = xserv;
	}
	
	getWindowAttributes() {
		return new Promise((ok, no) => {
			this.xserv.X.GetWindowAttributes(this.id, (err, attrs) => {
				if(err) {
					no(err);
				}
				else {
					ok(new Proxy(attrs, ATTR_PROXY));
				}
			});
		});
	}
	
	changeWindowAttributes(attrs) {
		return new Promise((ok, no) => {
			this.xserv.X.ChangeWindowAttributes(
				this.root, attrs
				
			);
		});
	}

	manageWindow(wid) {
		let X = this.xserv.X;
		X.GetWindowAttributes(wid, (err, attrs) => {
			if(attrs[8]) { // override-redirect flag
				X.MapWindow(wid);
				return;
			}
		})
	}
}

class WindowManager extends events.EventEmitter {
	constructor(xserv) {
		super();
		
		this.xserv = xserv;

		this.display = display;
		let X = this.X = display.client;
		X.require('render', (err, Render) => {
			X.Render = Render;
			this.root = display.screen[0].root;
			this.white = display.screen[0].white_pixel;

			X.ChangeWindowAttributes(root, {
				eventMask: x11.eventMask.Exposure|
					x11.eventMask.SubstructureRedirect
			}, err => this.replace_wm());

			X.QueryTree(root, (err, tree) => {
				for(let child of tree.children) {
					this.manageWindow(child);
				}
			})
		});
	}
	
	replace_wm() {
		throw new Error("Not implemented");
		
		// The method for replacing the current WM is pulled
		//  from the Metacity source, github.com/tthurman/Metacity
		//  which can be found in src/core/screen.c
		if(this.config.replace) {
			let X = this.X;
			
			X.InternAtom(false, "WM_S")
			
			X.GetSelectionOwner(this.display, X.atoms)
			X.ChangeWindowAttributes(this.display)
		}
		else {
			throw new Error("Error: another window manager is already running");
		}
   });
}
