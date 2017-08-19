'use strict';

class SpriteManager {
	constructor() {
		this.stage = document.getElementById("sprites");
		this.animations = {};
		this.spritesheets = {};
	}

	init() {}
	
	loadSpritesheet(config) {
		// Use name for common properties
		let
			w = config.width, h = config.height,
			style =
			`.${config.name} {
				background:url(${config.file}) no-repeat;
				width:${config.width}px;
				height:${config.height}px;
			}`;
		
		this.spritesheets[config.name] = config;
			
		// Load the sprites
		let sprites = {}, r = 0;
		
		for(let row of config.sprites) {
			var c = 0;
			for(let spr of row) {
				let
					x = c? `-${c*w}px` : "0",
					y = r? `-${r*h}px` : "0"
				sprites[spr] = `${x} ${y}`;
				++c;
			}
			++r;
		}
		
		// Load the animations
		for(let name in config.animations) {
			var c = 0;
			let an = config.animations[name], keyframes = "", p = an.frames.length;
			for(let frame of an.frames) {
				keyframes += `${100*c/p}%{background-position:${sprites[frame]}}`;
				++c;
			}
			
			this.animations[name] = an.frames;
			
			style +=
				`.${name}{
					background-position:${sprites[an.frames[0]]};
					width:${w}px;
					height:${h}px;
					animation:${name} ${an.time} steps(1) infinite
				}
				.${name}.pause{
					animation:none
				}
				@keyframes ${name}{
					${keyframes}
				}`;
		}
		
		let se = document.createElement('style');
		se.innerHTML = style.replace(/[\n\t]+/gm, '');
		
		document.head.prepend(se);
	}

	add(spr) {
		this.stage.appendChild(spr.elem);
	}
}

class Sprite {
	constructor(ss, name) {
		this.spritesheet = ss;
		this.name = name;
		this.elem = document.createElement('div');
		this.x = 0;
		this.y = 0;
		this.elem.className = "sprite";
		this.elem.classList.add(ss);
		this.elem.classList.add(name);
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
		if(x || y) {
			this.moveTo(this.x + x, this.y + y);
		}
	}
	
	addClass(cn) {
		this.elem.classList.add(cn);
	}
	
	removeClass(cn) {
		this.elem.classList.remove(cn);
	}
	
	toggleClass(cn, cond) {
		this.elem.classList.toggle(cn, cond);
	}
	
	hasClass(cn) {
		return this.elem.classList.contains(cn);
	}
}
