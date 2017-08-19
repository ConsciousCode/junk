'use strict';

const
	{app, BrowserWindow} = require('electron'),
	path = require('path'),
	url = require('url');

// Needs persistence
let win = null;

app.on('ready', () => win = createWindow());

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// MacOS likes users to explicitly close with C-Q
	if(process.platform !== 'darwin') {
		app.quit();
	}
})

app.on('activate', () => {
	// MacOS windows are destroyed when minimized
	if(win === null) {
		win = createWindow();
	}
})

function createWindow () {
	// Create the browser window.
	let win = new BrowserWindow({width: 480, height: 360});

	// and load the index.html of the app.
	win.loadURL(url.format({
		pathname: path.join(__dirname, 'stage.html'),
		protocol: 'file:',
		slashes: true
	}));

	// Open the DevTools.
	if(DEBUG) {
		win.webContents.openDevTools();
	}

	// Emitted when the window is closed.
	win.on('closed', () => win = null);

	return win;
}
