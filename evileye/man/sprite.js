'use strict';

class SpriteManager {
	constructor() {
		this.stage = document.getElementById("sprites");
	}

	init() {}

	add(spr) {
		this.stage.appendChild(spr.elem);
	}
}

class Sprite {
	constructor(name) {
		this.name = name;
		this.elem = document.createElement('div');
		this.x = 0;
		this.y = 0;
		this.elem.className = name;
		this.moveTo(0, 0);
	}

	moveTo(x, y) {
		this.elem.style.left = x + "px";
		this.elem.style.top = y + "px";

		this.x = x;
		this.y = y;
	}

	move(x, y) {
		// Avoid touching the DOM for no reason
		if(x | y) {
			this.moveTo(this.x + x, this.y + y);
		}
	}
}
