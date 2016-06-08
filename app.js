const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const request = require('request');
const dotenv = require('dotenv');
const passport = require('passport');
const InstagramStrategy = require('passport-instagram').Strategy;

dotenv.load();

app.use(cookieParser());
app.use(session({secret: "stringofwords"}));
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'pug');

//Server Listener
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

function getPosts(req, cb) {
	request({
		url: 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + req.session.access_token,
		method: 'GET'
	}, function(err,resp,body) {
		// let parsedBody = JSON.parse(resp),
		// 		data 			 = resp.body.data;
		let myPosts = JSON.parse(body).data;
		// console.log(myPosts[0]);
		cb(myPosts);
	});
}

//Root Path
app.get('/', function (req,res) {
	// console.log(req.session);
	if(req.session.access_token){
		// console.log('get / access token:  ' + req.session.access_token);
		getPosts(req, function(myPosts) {
		  res.render('index', {myName: req.session.username, posts: myPosts });
		});
	}else{
		res.render('index');
	}
});

//Get User Page
app.get("/user", function(){
	res.render('user');
});

//Instagram Authorization
app.get('/instagram_cb', function(req,res) {
	let code = req.query.code;
	request({
		url:'https://api.instagram.com/oauth/access_token', 
		form: {
			'client_id': 'c6afcf15e0c0444fa9c815f7adbc169c',
			'client_secret': '8abad1ba948c43a9be3779b831f0435b',
			'grant_type': 'authorization_code',
			'redirect_uri': 'http://localhost:3000/instagram_cb',
			'code': code
		},
		method: 'POST'
	}, function(err,resp,body) {
		var parsedBody = JSON.parse(body);
		req.session.access_token = parsedBody.access_token;
		req.session.username = parsedBody.user.username;
		res.redirect('/');
	});

});

app.get('/authcode', function(req,res){
	res.send(req.session.access_token);
});


app.get('/loadimage/:imageID', function(req,res){
	console.log(req.params.imageID);
	request({
		url: "https://api.instagram.com/v1/media/"+ req.params.imageID + "?access_token=" + req.session.access_token,
		method: 'GET'
	}, function(err,resp,data) {
		console.log(data);
		res.send(data);
	});
});

app.get('/logged_in', function(req, res) {
	// console.log('res from ig', req);
});
