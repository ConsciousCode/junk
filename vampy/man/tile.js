'use strict';

/**
 * Manage the foreground and background - they're such small
 *  tasks individually that it'd be wasteful to have
 *  dedicated managers.
**/
class TileManager {
	TILES = [
		"pickaxe", "holy-sigil", "torch", "rope",
		"milk", "blood", "wood", "stone",
		"wall", "base", "door", "bridge",
		"tree", "rock", "water", "grass"
	]
	
	constructor(config) {
		this.width = config.width;
		this.height = config.height;
		this.tiles = config.tiles;
		this.tilew = config.tilew;
		this.tileh = config.tileh;
		
		this.data = config.data;
		
		let ground = config.ground;
		ground.classList.add('tiled');
		
		ground.style.gridTemplateColumns =
			ground.style.gridTemplateRows =
				`repeat(${this.width/this.tilew}, 1fr)`;
		
		for(let i = 0; i < this.width*this.height; ++i) {
			ground.appendChild(document.createElement('div'));
		}
		this.ground = ground;
	}

	init() {}
	
	load(data) {
		let c = this.ground.children;
		for(let i = 0; i < this.width*this.height; ++i) {
			c[i].className = this.tiles[data[i]];
		}
		this.data = data;
	}
	
	move(dx, dy) {
		this.moveTo(
			this.vx + dx, this.vy + dy
		);
	}
	
	moveTo(vx, vy) {
		this.vx = vx;
		this.vy = vy;
		this.ground.style.left = vx + "px";
		this.ground.style.top = vy + "px";
	}
}
