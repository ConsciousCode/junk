'use strict';

const
	express = require('express'),
	db = require('./db');

const app = express.createServer();

// Not the most secure, but should be good enough
function random_secret(len) {
	let s = "";
	for(let i = 0; i < len; ++i) {
		s += Object.fromCharCode(Math.random()*0xffff);
	}
	return s;
}

function render_json(res, code, json) {
	res.type('json');
	try {
		json = JSON.stringify(json);
		res.status(code);
		res.send(json);
	}
	catch(e) {
		res.status(500);
		res.send('{"type":"error","msg":"Failed to stringify JSON"}');
	}
}

app.engine('jade', require('jade').__express);
app.set('view engine', 'jade');

app.use(require('less-middleware')({
	src: __dirname + "/css"
}));

app.use('/src', express.static('src'));
app.use('/img', express.static('img'));

app.use(require("express-session")({
	name: 'sid',
	rolling: true,
	secret: random_secret(16);
	cookie: {
		httpOnly: true,
		sameSite: true,
		secure: false //true when we have HTTPS
	}
}))

async function get_user(req) {
	try {
		return await db.get_user(req.query.user);
	}
	catch(e) {
		return req.session && req.session.user || null;
	}
}

app.get('/me', async function(req, res) {
	let user = await get_user(req);
	if(user === null) {
		res.redirect('/#login');
	}
	else {
		res.render('me', user);
	}
});

app.get('/login', async function(req, res) {
	let user = await get_user(req);
	if(user === null) {
		res.render('login', user);
	}
	else {
		res.redirect('/me');
	}
});

app.post('/login', async function(req, res) {
	let user = await db.auth_user(
		req.body.user, req.body.pass
	)
	if(user) {
		req.session.user = user;
		res.redirect('/me');
	}
	else {
		res.redirect('/login#fail');
	}
});

app.get('/logout', async function(req, res) {
	delete req.session.user;
	res.redirect('/');
});

/*
app.get('/search', async function(req, res) {

});
*/

/// REST API

app.get('/api/news.json', async function(req, res) {
	render_json(res, await db.get_news());
});

app.get('/api/user.json', async function(req, res) {
	let user = await get_user(req);
	if(user === null) {
		render_json(res, 401, {type: "error", msg: "No user provided"});
	}
	else {
		render_json(res, 200, user);
	}
});

app.get('/api/cred.json', async function(req, res) {
	if(req.query.user || req.session && req.session.user) {
		let cred = await db.get_cred(req.query.user || req.session.user.name);
		if(user === null) {
			render_json(res, 404, {type: "error", msg: "Unknown user"});
		}
		else {
			render_json(res, 200, cred);
		}
	}
	else {
		render_json(res, 401, {type: "error", msg: "No user provided"});
	}
});

function simple(n) {
	app.get("/" + n, (req, res) => {
		res.render(n);
	})
}
simple('api');
simple('about');
simple('donate');
simple('legal');
simple('contact');

app.get('/+:user', async function(req, res) {
	let user = await get_user(req.params.user);
	if(user === null) {
		res.status(404).render('404', req);
	}
	else {
		res.render('+user', user);
	}
}

app.listen(80);
