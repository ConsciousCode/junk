'use strict';

module.exports = function(trino) {
	trino.registerProtocol("file", function(fn) {
		let p = path.join(__dirname, "index.html");
		
		fs.stat(fn, stat => {
			this.load(path.join(__dirname,
				stat.isDirectory()?
					"directory.html" :
					"file.html"
			));
		});
	});
};
