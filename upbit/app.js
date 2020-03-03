const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const request = require('request');

const port = 3000;
const app = express();//import the module.

let apiCaller = (req, res, next) =>{
	if(!req.params.timeType || !req.params.timeValue){
		if(!req.custom) req.custom = {};
		req.custom.apiResult = "invalid request is denied in middleWare";
		next();
	}

	let url = 'https://api.upbit.com/v1/candles/' + req.params.timeType + '/' + req.params.timeValue;
	console.log(url);

	let options = {
		method: 'GET',
	  url: url,
	  qs: { market: 'market' }
	};

	request(options, function (error, response, body) {
	  if (error) throw new Error(error);
		if(!req.custom) req.custom = {};
	  req.custom.apiResult = body;
		next();
	});

};

app.set('view engine', 'jade');//mount the template engine to the certain app.
app.set('views', './views');//notice this directory is for jade template engine.

app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/test', (req, res) =>{
	res.send("welcome master, I'll suck you off!");
});

app.get('/upbit/:timeType/:timeValue', apiCaller, (req, res) =>{
	if(req.custom) res.json(req.custom.apiResult);
	else res.send("an error occurs");
});

app.listen(port, () => {
	console.log("server started");
});
