'use strict';

/**
 * An interface for an abstract directional user input.
 *
 * dh and dv return [-1, 1]
**/
class IJoystick {
	hs() {
		return 0;
	}
	vs() {
		return 0;
	}
}

/**
 * An interface for an abstract binary user input.
**/
class IButton {
	pressed() {
		return false;
	}
}

let listener = null;
class Key extends IButton {
	constructor(key) {
		super();

		this.value = false;

		listener.register_combo({
			keys: key,
			on_keydown: () => {
				this.value = true;
			},
			on_keyup: () => {
				this.value = false;
			}
		});
	}

	pressed() {
		return this.value;
	}
}

class InputManager {
	constructor() {
		listener = new keypress.Listener();

		this.up = new Key('up');
		this.down = new Key('down');
		this.left = new Key('left');
		this.right = new Key('right');
	}

	init() {
	}

	horiz() {
		return this.right.value - this.left.value;
	}

	vert() {
		return this.down.value - this.up.value;
	}
}
