$(document).ready(function(){
	setTimeout(function(){
		if(($("#hero").get(0).paused) == true) {
			$("#hero").css("opacity", "0");
			$("#hero").attr( 'poster', 'resources/img/homepage_banner.jpg');
			$("#hero_text, #overview, .navbar, #hero").fadeTo( "slow" , 1);
			$(".card").css("border-width", "1px");
		}
	}, 750);
	$("#hero").on("timeupdate", function(event){
		if(this.currentTime >= 1.5) {
			$("#hero_text, #overview, .navbar").fadeTo( "slow" , 1);
			$(".card").css("border-width", "1px");
		}
	});
	$('video').on('ended',function(){
		$("#hero").addClass("d-none");
		$("#heroSlides").removeClass("d-none");
	});
});