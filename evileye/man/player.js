'use strict';

class PlayerManager {
	constructor() {
		this.sprite = new Sprite('player');
		this.speed = 10;
	}

	init(game) {
		game.sprite.add(this.sprite);
	}

	update(game, dt) {
		let by = dt*this.speed;
		this.sprite.move(
			game.input.horiz()*by,
			game.input.vert()*by
		);
	}
}
