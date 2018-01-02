$( document ).ready(function() {

	$(window).on('activate.bs.scrollspy', function () {
		updateBackground();
	});

	pagemap(document.querySelector('#map'), {
		viewport: null,
		styles: {
		'header,footer,section,article': 'rgba(0,0,0,0.08)',
		'th': 'rgba(255,0,0,0.10)',
		'h1': 'rgba(255,0,0,0.8)',
		'.alert': 'rgba(0,0,0,0.3)',
		'img': 'rgba(130,0,0,0.3)',
		'h2,h3,h4,tr': 'rgba(0,0,0,0.03)',
		},
		back: 'rgba(0,0,0,0.02)',
		view: 'rgba(0,0,0,0.05)',
		drag: 'rgba(0,0,0,0.10)',
		interval: null
	});

	$(".dropdown-item, .nav-click").click(function(e) {
	e.preventDefault();
	anchorScroll( $(this), $($(this).attr("href")), 100 );
	});

	function anchorScroll(this_obj, that_obj, base_speed) {
		var this_offset = this_obj.offset();
		var that_offset = that_obj.offset();
		var offset_diff = Math.abs(that_offset.top - this_offset.top + 56);

		var speed       = (offset_diff * base_speed) / 1000;

		$("html,body").animate({
			scrollTop: that_offset.top - 56
		}, speed);
	}

	function updateBackground() {
		if ($('#me_dice_nav').hasClass('active') || $('#me_va_nav').hasClass('active') || $('#me_ea_nav').hasClass('active') || $('#home_nav').hasClass('active')) {
			$('#bg').css("background-size", "0");
			$('body').css("background-size", "12%");
		} else {
			$('#bg').css("background-size", "20%");
			$('body').css("background-size", "0");
		}
	}
});