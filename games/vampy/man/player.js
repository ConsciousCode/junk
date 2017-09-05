'use strict';

class PlayerManager {
	constructor() {
		this.sprite = new Sprite('sprites', 'player-walk');
		this.speed = 1;
	}

	init(game) {
		game.sprite.add(this.sprite);
	}

	update(game, dt) {
		let
			by = dt*this.speed,
			hs = game.input.horiz()*by,
			vs = game.input.vert()*by
		
		this.sprite.move(hs, vs);
		
		if(hs < 0) {
			this.sprite.addClass('flip');
		}
		else if(hs > 0) {
			this.sprite.removeClass('flip');
		}
		this.sprite.toggleClass('pause', !(hs || vs));
	}
}
