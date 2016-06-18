io.on('connection', function(socket){ /* … */ 
	
	console.log('somebody connected');

  console.log('fetching their follows');

  getFollows(req, function(follows) {
    // socket.emit('follows', follows);

    console.log('fetching posts for users');

    Promise.all(follows.map(function (user) {
      console.log('fetching posts for user ', user.id);
      return getPosts(user.id, function (posts) {
        socket.emit('posts', posts});
      });
    })).then(function(){
    	sortArray(posts);
      socket.emit('render posts', posts);
    });
	});

});

function sortArray(array){
	array.sort(function(a,b){
		b - a;
	});
}

/////////////////////////////

function getFollows(req,cb){
	getFollowsFromInstagram(req.session.access_token, function(err,resp,data){
		console.log("GetFollows data: ", data);
		let body = JSON.parse(data);
		cb(body); //socket.emit('follows', body);
	});
}

//getFollows
function getFollowsFromInstagram(accesstoken, cb){
	request({
		url: "https://api.instagram.com/v1/users/self/follows?access_token=" + accesstoken,
		method: 'GET'
	}, cb);
}

function getPosts(req,cb){
	getPostsFromInstagram(req.session.access_token, function(err,resp,data){
		console.log("GetPosts data: ", data);
		let myPosts = JSON.parse(body); //.data;
		cb(myPosts); // socket.emit('posts', myPosts});
	}); 
}

function getPostsFromInstagram(){
	request({
		url: 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + req.session.access_token,
		method: 'GET'
	}, cb);
}