const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const request = require('request');
const dotenv = require('dotenv');
const passport = require('passport');
const InstagramStrategy = require('passport-instagram').Strategy;
const bodyParser = require("body-parser");
const server = require('http').createServer(app);
const io = require('socket.io').listen(app.listen(3000));

dotenv.load();

app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({secret: "stringofwords"}));
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'pug');

// let pgp = require('pg-promise')();
// let db = pgp(connection);
let INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID
let INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET

//Server Listener
// app.listen(3000, function () {
//   console.log('Example app listening on port 3000!');
// });

//Root Path
app.get('/', function (req,res) {
	if(req.session.access_token){
		getPosts(req, function(myPosts) {
		  res.render('index', {myName: req.session.username, posts: myPosts.data});
		});
	}else{
		res.render('index');
	}
});

//Get User Page
app.get("/user", function(){
	res.render('user');
});

//Get login code
app.get('/instagram/code', function(req,res){
	res.redirect(
		"https://api.instagram.com/oauth/authorize/?client_id=" + INSTAGRAM_CLIENT_ID + 
		"&redirect_uri=http://localhost:3000/instagram/auth&response_type=code")
});


//Instagram Authorization
app.get('/instagram/auth', function(req,res) {
	let code = req.query.code;
	request({
		url:'https://api.instagram.com/oauth/access_token', 
		form: {
			'client_id': 'c6afcf15e0c0444fa9c815f7adbc169c',
			'client_secret': '8abad1ba948c43a9be3779b831f0435b',
			'grant_type': 'authorization_code',
			'redirect_uri': 'http://localhost:3000/instagram/auth',
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

//Load Bazaar
app.get('/bazaar', function(req,res){
	//List of my bazaars
});


//Get all users you follow, sort by date, grab their most recent posts, and send to the view
app.get('/bazaar/:bazaarID', function(req,res){
	let bazaar = req.params.bazaarID;
	var userArray = [];
	getFollows(req, function(follows){
		follows.data.forEach(function(userData){ //seperate method
			//call new method for logic below
			getUserFeed(req, userData.id, function(response){
				userArray.push(response);
				userArray.sort(function(a,b){
					return b.post.caption.created_time - a.post.caption.created_time;
				});
			});
		});
		if(req.session.access_token){
			  res.render('index', {myName: req.session.username, posts: userArray});
		}else{
			res.render('index');
		}
	});
});

//Get Instagram access token
app.get('/instagram/accesstoken', function(req,res){
	console.log("/instagram/accesstoken: ", req.session.access_token, ", req: ", req);
	res.json({access_token: req.session.access_token});
});

//Instagram load follows
app.get('/instagram/user/follows', function(req,res){
	getFollowsFromInstagram(req.session.access_token, function(err,resp,data) {
		console.log("follows: ", data);
		res.send(data);
	});
});

//Instagram load user by ID
app.get('/instagram/user/:userID', function(req,res){
	request({
		url: "https://api.instagram.com/v1/users/"+ req.params.userID + "?access_token=" + req.session.access_token,
		method: 'GET'
	}, function(err,resp,data) {
		console.log("Users by ID: ", data);
		res.send(data);
	});
});

//Instagram load image by ID
app.get('/instagram/image/:imageID', function(req,res){
	request({
		url: "https://api.instagram.com/v1/media/"+ req.params.imageID + "?access_token=" + req.session.access_token,
		method: 'GET'
	}, function(err,resp,data) {
		res.send(JSON.parse(data));
	});
});

// app.get('/instagram/accesstoken', function(req,res){
// 	res.send(req.session.access_token);
// });

//Logout
app.get('/logout', function(req,res){
	req.session.destroy();
	res.redirect('/');
});

//Create bazaar feed
function getFollows(req,cb){
	getFollowsFromInstagram(req, function(err,resp,data){
		console.log("GetFollows data:", data);
		let stuff = JSON.parse(data);
		cb(stuff);
	});
}

//getFollows
function getFollowsFromInstagram(accesstoken, cb){
	request({
		url: "https://api.instagram.com/v1/users/self/follows?access_token=" + accesstoken,
		method: 'GET'
	}, cb);
}

function getUserFeed(req, userid, cb){
	request({
		url: "/instagram/user/" + userid,
		method: "GET",
	}, function(err,resp,data){
		console.log("getUserFeed: ", data);
		let body = JSON.parse(data);
		cb(body);
	});
}

//Loads posts into feed
function getPosts(req,cb){
	getPostsFromInstagram(req.session.access_token, function(err,resp,data){
		// console.log("GetPosts data: ", data);
		let myPosts = JSON.parse(data); //.data;
		cb(myPosts); // socket.emit('posts', myPosts});
	}); 
}

function getPostsFromInstagram(access_token, cb){
	request({
		url: 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + access_token,
		method: 'GET'
	}, cb);
}

function getAccessToken(cb){
	request({url: 'http://localhost:3000/instagram/accesstoken', method: "GET"}, function(err, resp, data){
		console.log("getAccessToken: ", data, "resp: ", resp);
		if(err) { return cb(err); }
		cb(null, data);
	});	
}

app.get('/test', function(){
	getAccessToken();
});

io.listen(server);
io.on('connection', function(socket){ /* … */ 
	
	console.log('somebody connected');

  console.log('fetching their follows');

  getAccessToken(function(err, token){
  	//TODO: Error Handling
	  getFollows(token, function(follows) {
	    // socket.emit('follows', follows);

	    console.log('fetching posts for users');

	    console.log("Follows: ", follows);
	    // Promise.all(follows.map(function (user) {
	    //   console.log('fetching posts for user ', user.id);
	    //   return getPosts(user.id, function (posts) {
	    //     socket.emit('posts', posts);
	    //   });
	    // })).then(function(){
	    // 	sortArray(posts);
	    //   socket.emit('render posts', posts);
	    // });
		});
	});

});

function sortArray(array){
	array.sort(function(a,b){
		b - a;
	});
}