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

	// $('$instaPhoto .image').on('click', function(){
	// 	$.ajax{
	// 		method: "GET",
	// 		url: "",
	// 		sucess: {

	// 		}
	// 	}
	// });

});

//Load shop
function loadShop(photoID, coords){
	$("#myCart").css({
		"top": coords.top,
		"left": $(".is-parent").offset().left + $(".is-parent").outerWidth() + 10
	}).appendTo($(".is-parent"));
	loadImage(photoID, function(data){
		console.log(data);
		// $('.product-image').attr('src', )
	});
}

function loadImage(imageID, cb){
	$.ajax({
		method: "GET",
		url: "/loadimage/" + imageID,
		success: function(data){
			cb(data);
		}
	});
}