'use strict';

/**
 * Manage the foreground and background - they're such small
 *  tasks individually that it'd be wasteful to have
 *  dedicated managers.
**/
class GroundManager {
	TILES = [
		"pickaxe", "holy-sigil", "torch", "rope",
		"milk", "blood", "wood", "stone",
		"wall", "base", "door", "bridge",
		"tree", "rock", "water", "grass"
	]
	
	constructor() {
		this.fore = document.getElementById("foreground");
		this.back = document.getElementById("background");
		
		this.width = 256;
		this.height = 256;
		this.map = new Uint8Array(this.width*this.height);
		
		this.vx = 0;
		this.vy = 0;
	}

	init() {}
	
	moveView(dx, dy) {
		let vx = this.vx, vy = this.vy;
		this.vx += dx;
		this.vy += dy;
		
		this.fore.style.left = this.vx + 'px';
		this.fore.style.top = this.vy + 'px';
		
		// Array.from so .remove won't mess up the iteration
		for(let child of Array.from(this.fore.children)) {
			if(child.offsetLeft < this.vx) {
				child.remove();
			}
		}
	}
}
