$(document).ready(function() {
	var instaRoot = "https://api.instagram.com/v1";

	$(".login-form").css({
		"top": $(".nav").offset().top + $(".nav").outerHeight(),
		"right": 0,
		"position": "absolute"
	});

	//login form on hover
	$("#login").hover(function(){
		$(".login-form").css({
			"top": $(".nav").offset().top + $(".nav").outerHeight(),
			"right": 0,
			"position": "absolute",
			"display": "block"
		})
	}, function(){
		$(".login-form").css({"display": "none"});
	});

	//login form display
	$(".login-form").hover(function(){
		$(".login-form").css({"display": "block"});
	}, function(){
		$(".login-form").css({"display": "none"});
	});

	//close shop
	$("#myCart .delete").click(function(){
		$(this).parent().toggleClass('hidden');
	});

	//Shop selector
	$(".tile .title .fa").click(function(){
		// if(coords.top == $("$myCart".offset().top)){
		$("#myCart").toggleClass("hidden");
		// }
		var photoID = $(this).parent().next().data('photoid');
		var coords = $(this).offset();
		loadShop(photoID, coords);
	});

	//Load more images on bottom
	$(window).scroll(function() {
		if($(window).scrollTop() == $(document).height() - $(window).height()) {
			 // ajax call get data from server and append to the div
		}
	});

});

//Load shop
function loadShop(photoID, coords){
	$("#myCart").css({
		"top": coords.top,
		"left": $(".is-parent").offset().left + $(".is-parent").outerWidth() + 10
	}).appendTo($(".is-parent"));
	loadImage(photoID, function(data){
		var targetImage = data.data.images.thumbnail.url;
		$('.product-image').attr('src', targetImage);
	});
}

function loadImage(imageID, cb){
	$.ajax({
		method: "GET",
		url: "/instagram/image/" + imageID,
		success: function(data){
			cb(data);
		}
	});
}

(function () {
	var socket = io.connect('http://localhost:3000'); //Change source to node_module in index.pug

	// var handlers = {
	// 	'follows': function (data) {
	// 		console.log('follows message handler');
	// 		console.log(data);
	// 	},
	// 	'posts': function (data) {
	// 		console.log('posts message handler');
	// 		console.log(data);
	// 	}
	// };

	socket.on("hello", function(data){
		console.log("HELLO");
	});

	socket.on('follows', function(data){
		//get follows
	});

	socket.on('posts', function(data){
		//get posts
		console.log(data);

	});

	//find way to parse with handlers

})();