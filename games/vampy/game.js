'use strict';

class Game {
	constructor() {
		this.fps = 60;

		this.input = new InputManager();
		this.audio = new AudioManager();

		this.overlay = new OverlayManager();
		this.sprite = new SpriteManager();
		this.ground = new GroundManager();

		this.updates = [];

		this.player = new PlayerManager();
		this.updates.push(this.player);

		this.init();
	}

	init() {
		this.input.init(this);
		this.audio.init(this);
		this.overlay.init(this);
		this.sprite.init(this);
		this.ground.init(this);
		this.player.init(this);
	}

	register(handler) {
		this.updates.push(handler);
	}

	step(dt) {
		for(let up of this.updates) {
			up.update(this, dt);
		}
	}

	run() {
		let last = Date.now();
		setInterval(() => {
			let cur = Date.now();
			this.step((cur - last)*this.fps/1000);
			last = cur;
		}, 1000/this.fps);
	}
}
