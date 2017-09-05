'use strict';

function randomToken() {
	let tok = "";
	for(let i = 0; i < 4; ++i) {
		tok += String.fromCharCode(Math.random()*0xffff);
	}

	return tok;
}
