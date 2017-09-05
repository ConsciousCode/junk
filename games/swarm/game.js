//var game = (function() {
	'use strict';
	
	const Tile = {
		SIZE: 32,
		COUNT: 6,
		draw: function(t, x, y, g) {
			g.fillStyle = [
				"saddlebrown",
				"grey",
				"tan",
				"dodgerblue",
				"blue",
				"gold"
			][t] || "grey";//"magenta";
			
			g.fillRect(x, y, this.SIZE, this.SIZE);
			g.strokeRect(x + 0.5, y + 0.5, this.SIZE - 1, this.SIZE - 1);
		}
	};
	
	function Map(data) {
		this.data = data;
	}
	Map.SIZE = 256;
	Map.prototype.get = function(x, y) {
		if(x < 0 || y < 0 || x >= Map.SIZE || y >= Map.SIZE) {
			return -1;
		}
		
		return this.data[y*Map.SIZE + x];
	}
	Map.prototype.set = function(x, y, v) {
		if(x < 0 || y < 0 || x >= Map.SIZE || y >= Map.SIZE) {
			return;
		}
		
		this.data[y*Map.SIZE + x] = v;
	}
	Map.prototype.draw = function(view, g) {
		const
			x0 = (view.x/Tile.SIZE)|0,
			y0 = (view.y/Tile.SIZE)|0,
			offx = (view.x%Tile.SIZE)|0,
			offy = (view.y%Tile.SIZE)|0;
		
		for(let y = -1; y < 17; ++y) {
			for(let x = -1; x < 22; ++x) {
				Tile.draw(
					this.get(x + x0, y + y0),
					x*Tile.SIZE - offx, y*Tile.SIZE - offy, g
				);
			}
		}
	}
	
	function intersects(rect, pos) {
		return (
			pos.x >= rect.x &&
			pos.y >= rect.y &&
			
			pos.x <= rect.x + rect.w &&
			pos.y <= rect.y + rect.h
		);
	}
	
	function TestBody() {}
	TestBody.prototype.draw = function(g, x, y) {
		g.fillStyle = "blue";
		g.fillRect(x, y, 16, 16);
	}
	
	function Ent(data) {
		this.x = data.x;
		this.y = data.y;
		this.body = data.body;
		this.brain = data.brain;
	}
	Ent.prototype.draw = function(view, g) {
		if(intersects(view, this)) {
			this.body.draw(g, this.x - view.x, this.y - view.y);
		}
	}
	
	function Overmind() {
		this.digs = [];
	}
	Overmind.prototype.dig = function(x, y) {
		this.digs.push({x: x, y: y});
	}
	
	const
		canvas = document.getElementById("view"),
		g = canvas.getContext("2d"),
		map = new Map(new Uint8Array(Map.SIZE*Map.SIZE)),
		ents = [],
		view = {
			x: (Map.SIZE/2)*Tile.SIZE - 320,
			y: (Map.SIZE/2)*Tile.SIZE - 240,
			w: 640,
			h: 480
		},
		keys = {};
	
	let curtile = 0;
	
	$(document).keydown(function(e) {
		keys[String.fromCharCode(e.which)] = true;
		
		if(e.which == 38) {
			++curtile;
		}
		else if(e.which == 40) {
			--curtile;
		}
		
		curtile += Tile.COUNT;
		curtile %= Tile.COUNT;
	}).keyup(function(e) {
		keys[String.fromCharCode(e.which)] = false;
	})
	
	var debug_text = "0 , 0"
	$(canvas).mousedown(function(e) {
		map.set(
			((view.x + e.offsetX)/Tile.SIZE)|0,
			((view.y + e.offsetY)/Tile.SIZE)|0,
			curtile
		);
	}).mousemove(function(e) {
		if(e.buttons&1) {
			map.set(
				((view.x + e.offsetX)/Tile.SIZE)|0,
				((view.y + e.offsetY)/Tile.SIZE)|0,
				curtile
			);
		}
		debug_text =
			(((view.x + e.offsetX)/Tile.SIZE)|0) + " , " +
			(((view.y + e.offsetY)/Tile.SIZE)|0);
	});
	
	for(var x = 0; x < 5; ++x) {
		for(var y = 0; y < 5; ++y) {
			map.set(Map.SIZE/2 - 3 + x, Map.SIZE/2 - 3 + y, 3);
		}
	}
	map.set(127, 124, 2);
	map.set(124, 127, 2);
	map.set(130, 127, 2);
	map.set(127, 130, 2);
	
	for(var i = 0; i < 10; ++i) {
		ents.push(new Ent({
			x: Math.random()*640,
			y: Math.random()*480,
			body: new TestBody(),
			brain: null
		}));
	}
	
	const MINSPEED = 5, MAXSPEED = 13, VIEWACCEL = 0.05;
	let viewspeed = MINSPEED;
	setInterval(function step() {
		if(keys.D || keys.A || keys.S || keys.W) {
			view.x += ((keys.D|0) - (keys.A|0))*viewspeed;
			view.y += ((keys.S|0) - (keys.W|0))*viewspeed;
			
			viewspeed += VIEWACCEL;
			if(viewspeed > MAXSPEED) {
				viewspeed = MAXSPEED;
			}
		}
		else {
			viewspeed = MINSPEED;
		}
	}, 1000/60);
	
	requestAnimationFrame(function animate() {
		g.clearRect(0, 0, 640, 480);
		
		map.draw(view, g);
		for(let ent of ents) {
			ent.draw(view, g);
		}
		Tile.draw(curtile, 0, 0, g);
		
		g.font = "24px serif";
		g.fillStyle = "black";
		g.fillRect(0, 480 - 32, 640, 32);
		g.fillStyle = "white";
		g.fillText(debug_text, 8, 480 - 8);
		
		requestAnimationFrame(animate);
	});
//})();
