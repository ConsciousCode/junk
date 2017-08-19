const xorg = require('./xorg');

let wm = new xorg.WindowManager();

wm.replace_wm();

wm.on('event', ev => {
	
});
