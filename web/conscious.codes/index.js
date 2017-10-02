'use strict';

const app = require("express")();

app.set('view engine', 'pug');

app.get(['/', '/project/'], (req, res) => {
	res.render('index', {});
})

app.listen(80);
