'use strict';

function byid(id) {
	return document.getElementById(id);
}

const ui = {
	tabs: byid('tabs'),
	browse: sbyid('browse'),
	prev: byid('prev'),
	next: byid('next'),
	reload: byid('load'),
	omnibar: byid('omni'),
	settings: byid('settings'),
	bookmarks: byid('bookmarks'),
	main: byid('main')
};

function reloadView() {
	view
}
