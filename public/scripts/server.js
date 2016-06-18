(function () {
	var socket = io.connect('http://localhost');

	var handlers = {
		'follows': function (data) {
			console.log('follows message handler');
			console.log(data);
		},
		'posts': function (data) {
			console.log('posts message handler');
			console.log(data);
		}
	};

	socket.on('follows', function(data){
		//get follows
	});

	socket.on('posts', function(data){
		//get posts
		console.log(data);

	});

	//find way to parse with handlers

})();

function createPost(){

}
