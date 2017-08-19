var uzu = (function() {
	'use strict';
	
	var cmds = {
		'\x00': 
		LINE x1 y1 x2 y2
		POLYLINE np (x, y)...
		CIRCLE cx cy r
		ELLIPSE cx cy rx ry
		RECT x y w h rx ry
		PATH np (cmd params...)...
		GROUP ng shape...

		NEW tpl id
		DELETE id
		TRANSFORM id mat tween

	};
	
	function shape(type, attrs) {
		var e = document.createElementNS("svg", type);
		
		for(var a in attrs) {
			e.setAttribute(a, attrs[a]);
		}
		
		return e;
	}
	
	function group(elems) {
		var e = document.createElementNS("svg", "g");
		
		for(var i = 0; i < elems.length; ++i) {
			e.appendChild(elems[i]);
		}
		
		return e;
	}
	
	var uzu_chunk = {
		DEFS: new Inform([
			{type: ">u32", name: "entries"},
			{
				type: 
		])
	};
	
	var uzu_def = new Inform([
		"\x00\xd8UZU",
		{type: ">u8", name: "major"},
		{type: ">u8", name: "minor"},
		{
			type: Inform.repeat(Infinity, new Inform([
				{type: ">u32", name: "length"},
				{type: "byte", count: 4, name: "name"},
				{
					type: "byte",
					count: function(state) {
						return state.length - 4;
					},
					build: function(state, data) {
						var chunk = uzu_chunk[state.name];
						if(chunk) {
							return chunk.parse(data)
						}
						
						return null;
					}
				}
			])),
			name: "chunks"
		}
	]);
	
	function load(f) {
		 new Stream(f).
			expect("\x00\xd8UZU", function() {
				throw new Error("Not an uzu file");
			}).
			next(">u32", function(len) {
				this.next(4, function(type) {
					switch(type) {
						case "mETA":
							break;
						case "CODE":
							break;
						case "STYL":
							break;
						case "DEFS":
							break;
						case "ANIM":
							this.next(u32, function(frames) {
								for(var f = 0; f < frames.value; ++f) {
									this.next(u32, function(dur) {
										this.data.dur = dur;
									}).next(u8, function(repeat) {
										this.data.repeat = repeat;
									}).next(u16, function(size) {
										for(var i = 0; i < size.value; ++ i) {
											this.next(u4, function(cmd) {
												switch(cmd.value) {
													//Create
													case 0:
														
												}
											});
										}
									})
								}
							});
					}
				});
			}
	}
})();
