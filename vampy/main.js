'use strict';

document.addEventListener("DOMContentLoaded", function(event) {
	for(let h of delay) {
		h();
	}

	let game = new Game();
	
	game.sprite.loadSpritesheet(sprites_ss);
	
	game.run();
});
