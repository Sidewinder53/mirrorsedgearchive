$(document).ready(function(){

	var skipped = 'false';

	$.getScript('/resources/js/cookie-consent.js');

	if(Cookies.get('skip_intro') =='true') {
		skipped = 'true';
		$("#hero_text, #overview, #cookie_consent, .navbar").fadeTo( "slow" , 1);
		$(".card").css("border-width", "1px");
		$(".card .bg-light").css("background-color", "#f8f9fa");
	}

	setTimeout(function(){
		if(($("#hero").get(0).paused) == true) {
			$("#hero_text, #overview, .navbar").fadeTo( "slow" , 1);
			$(".card").css("border-width", "1px");
		}
	}, 1000);

	setTimeout(function(){
		$("#faithHeroText").css('height', '5em');
	}, 1500);

	$("#hero").on("timeupdate", function(event){
		if(this.currentTime >= 1.5 && skipped == 'false') {
			$("#hero_text, #overview, #cookie_consent, .navbar").fadeTo( "slow" , 1);
			$(".card").css("border-width", "1px");
			Cookies.set("skip_intro", 'true', { expires: 1/24 });
		}
	});

	$('video').on('ended',function(){
		$("#heroSlides").carousel(0);
		$("#hero").addClass("d-none");
		$("#heroSlides").removeClass("d-none");
		$("#media_copyright").fadeTo( "slow" , 1);
	});

});