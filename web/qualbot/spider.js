'use strict';

const
	events = require("events"),
	http = require("http")

class Spider extends events.EventEmitter {
	constructor() {
		super();
		
		this.visited = [];
		this.todo = [];
		this.waiting = false;
	}
	
	visit(url) {
		if(!this.haveVisited(url) && !this.waiting) {
			this.todo.push(url);
		}
	}
	
	haveVisited(url) {
		return this.visited.indexOf(url) != -1;
	}
	
	crawlNext() {
		this.fetch(this.todo.pop());
	}
	
	fetch(url) {
		http.get(url, res => {
			this.visited.push(url);
			
			if(res.statusCode == 200) {
				var data = "";
				res.on('data', chunk => data += chunk);
				res.on('end', () => {
					this.emit('visit', url, data);
				});
			}
			
			this.crawlNext();
		});
	}
}
